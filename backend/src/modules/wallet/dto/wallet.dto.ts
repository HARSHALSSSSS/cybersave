import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateWalletTopUpDto {
  @IsNumber()
  @Min(1)
  amount!: number;

  @IsString()
  idempotencyKey!: string;
}

export class ConfirmWalletTopUpDto {
  @IsOptional()
  @IsBoolean()
  mockCapture?: boolean;

  @IsOptional()
  @IsString()
  razorpayPaymentId?: string;

  @IsOptional()
  @IsString()
  razorpayOrderId?: string;

  @IsOptional()
  @IsString()
  razorpaySignature?: string;
}
