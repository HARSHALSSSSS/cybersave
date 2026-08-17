import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PaymentStatus,
  Prisma,
  WalletTopUpStatus,
  WalletTransactionType,
} from '@prisma/client';

import { PrismaService } from '@/database/database.module';
import {
  PAYMENT_PROVIDER,
  type PaymentProvider,
} from '@/integrations/payment/payment-provider.interface';
import { RazorpayPaymentProvider } from '@/integrations/payment/razorpay-payment.provider';
import {
  isLiveRazorpayOrderId,
  publicRazorpayKeyId,
  shouldUseRazorpayProvider,
} from '@/integrations/payment/razorpay-enabled';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject(PAYMENT_PROVIDER) private readonly paymentProvider: PaymentProvider,
    private readonly razorpayProvider: RazorpayPaymentProvider,
  ) {}

  async getSummary(citizenId: string) {
    const wallet = await this.getOrCreateWallet(citizenId);
    const transactions = await this.prisma.walletTransaction.findMany({
      where: { citizenId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    return {
      balance: Number(wallet.balance),
      currency: wallet.currency,
      provider: shouldUseRazorpayProvider(this.configService) ? 'razorpay' : 'mock',
      keyId: this.getPublicKeyId(),
      transactions: transactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: Number(tx.amount),
        balanceAfter: Number(tx.balanceAfter),
        referenceType: tx.referenceType,
        referenceId: tx.referenceId,
        description: tx.description,
        createdAt: tx.createdAt,
      })),
    };
  }

  async createTopUpIntent(citizenId: string, amount: number, idempotencyKey: string) {
    if (!Number.isFinite(amount) || amount < 1) {
      throw new BadRequestException('Enter a valid top-up amount');
    }

    const existing = await this.prisma.walletTopUp.findUnique({
      where: { idempotencyKey },
    });
    if (existing) {
      return this.formatTopUpIntent(existing);
    }

    const wallet = await this.getOrCreateWallet(citizenId);
    const order = await this.paymentProvider.createOrder({
      applicationId: `wallet-topup-${wallet.id}`,
      citizenId,
      amount,
      currency: 'INR',
      idempotencyKey,
    });

    const topUp = await this.prisma.walletTopUp.create({
      data: {
        walletId: wallet.id,
        citizenId,
        amount: new Prisma.Decimal(amount),
        currency: 'INR',
        status: WalletTopUpStatus.PENDING,
        razorpayOrderId: order.providerRef,
        idempotencyKey,
      },
    });

    return this.formatTopUpIntent(topUp);
  }

  async confirmTopUp(
    citizenId: string,
    topUpId: string,
    options?: {
      mockCapture?: boolean;
      razorpayPaymentId?: string;
      razorpayOrderId?: string;
      razorpaySignature?: string;
    },
  ) {
    const topUp = await this.prisma.walletTopUp.findFirst({
      where: { id: topUpId, citizenId },
    });
    if (!topUp) throw new NotFoundException('Top-up not found');

    if (topUp.status === WalletTopUpStatus.SUCCESS) {
      return this.formatTopUpResult(topUp);
    }
    if (topUp.status === WalletTopUpStatus.FAILED) {
      throw new BadRequestException('Top-up failed. Start a new recharge.');
    }

    const liveOrder = isLiveRazorpayOrderId(topUp.razorpayOrderId);
    const useMock =
      !liveOrder &&
      (options?.mockCapture === true ||
        !topUp.razorpayOrderId ||
        topUp.razorpayOrderId.startsWith('mock_'));

    if (!useMock) {
      if (!options?.razorpayPaymentId || !options?.razorpayOrderId || !options?.razorpaySignature) {
        throw new BadRequestException('Missing Razorpay payment details');
      }
      const valid = this.razorpayProvider.verifyCheckoutSignature(
        options.razorpayOrderId,
        options.razorpayPaymentId,
        options.razorpaySignature,
      );
      if (!valid) {
        throw new BadRequestException('Invalid payment signature');
      }
      const verified = await this.paymentProvider.verifyPayment(options.razorpayOrderId);
      if (!verified.success) {
        await this.prisma.walletTopUp.update({
          where: { id: topUp.id },
          data: { status: WalletTopUpStatus.FAILED },
        });
        throw new BadRequestException('Payment verification failed');
      }
    }

    const amount = Number(topUp.amount);
    const updated = await this.prisma.$transaction(async tx => {
      const wallet = await tx.wallet.findUniqueOrThrow({ where: { id: topUp.walletId } });
      const balanceAfter = Number(wallet.balance) + amount;

      const successTopUp = await tx.walletTopUp.update({
        where: { id: topUp.id },
        data: {
          status: WalletTopUpStatus.SUCCESS,
          razorpayPaymentId: options?.razorpayPaymentId ?? topUp.razorpayPaymentId,
        },
      });

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: new Prisma.Decimal(balanceAfter) },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          citizenId,
          type: WalletTransactionType.TOPUP,
          amount: new Prisma.Decimal(amount),
          balanceAfter: new Prisma.Decimal(balanceAfter),
          referenceType: 'wallet_top_up',
          referenceId: topUp.id,
          description: 'Wallet recharge',
        },
      });

      return successTopUp;
    });

    return this.formatTopUpResult(updated);
  }

  async debitForApplication(
    citizenId: string,
    applicationId: string,
    paymentId: string,
    amount: number,
  ) {
    const wallet = await this.getOrCreateWallet(citizenId);
    const balance = Number(wallet.balance);

    if (balance < amount) {
      throw new BadRequestException({
        message: 'Insufficient wallet balance',
        code: 'INSUFFICIENT_WALLET_BALANCE',
        balance,
        required: amount,
      });
    }

    const balanceAfter = balance - amount;

    await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: new Prisma.Decimal(balanceAfter) },
      }),
      this.prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          citizenId,
          type: WalletTransactionType.DEBIT,
          amount: new Prisma.Decimal(amount),
          balanceAfter: new Prisma.Decimal(balanceAfter),
          referenceType: 'application_payment',
          referenceId: paymentId,
          description: `Service application payment`,
        },
      }),
      this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.CAPTURED,
          provider: 'wallet',
        },
      }),
      this.prisma.paymentTransaction.create({
        data: {
          paymentId,
          eventType: 'WALLET_DEBIT',
          providerRef: wallet.id,
        },
      }),
      this.prisma.application.update({
        where: { id: applicationId },
        data: { status: 'PAYMENT_PENDING' },
      }),
    ]);

    return {
      success: true,
      paymentId,
      balanceAfter,
    };
  }

  private async getOrCreateWallet(citizenId: string) {
    const existing = await this.prisma.wallet.findUnique({ where: { citizenId } });
    if (existing) return existing;

    try {
      return await this.prisma.wallet.create({
        data: { citizenId, balance: new Prisma.Decimal(0), currency: 'INR' },
      });
    } catch {
      const retry = await this.prisma.wallet.findUnique({ where: { citizenId } });
      if (retry) return retry;
      throw new ConflictException('Could not create wallet');
    }
  }

  private getPublicKeyId(): string {
    return publicRazorpayKeyId(this.configService);
  }

  private formatTopUpIntent(topUp: {
    id: string;
    amount: { toString(): string };
    currency: string;
    status: WalletTopUpStatus;
    razorpayOrderId: string | null;
    idempotencyKey: string;
  }) {
    return {
      id: topUp.id,
      amount: topUp.amount.toString(),
      currency: topUp.currency,
      status: topUp.status,
      orderId: topUp.razorpayOrderId,
      keyId: this.getPublicKeyId(),
      provider: shouldUseRazorpayProvider(this.configService) ? 'razorpay' : 'mock',
      idempotencyKey: topUp.idempotencyKey,
    };
  }

  private formatTopUpResult(topUp: {
    id: string;
    amount: { toString(): string };
    status: WalletTopUpStatus;
  }) {
    return {
      id: topUp.id,
      amount: topUp.amount.toString(),
      status: topUp.status,
      success: topUp.status === WalletTopUpStatus.SUCCESS,
    };
  }
}
