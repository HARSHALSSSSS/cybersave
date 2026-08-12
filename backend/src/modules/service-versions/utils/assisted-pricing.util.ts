type FulfillmentLike = {
  assistedEnabled?: boolean;
  defaultPlatformFee: { toString(): string };
  stateVariants: Array<{
    stateCode: string;
    platformFee: { toString(): string } | null;
  }>;
} | null;

type PricingLike = {
  baseFee: { toString(): string };
  taxEnabled: boolean;
  taxRate: { toString(): string };
  additionalCharges: Array<{ amount: { toString(): string } }>;
} | null;

export function resolveAssistedPlatformFee(
  fulfillment: FulfillmentLike,
  stateCode?: string | null,
): number {
  if (!fulfillment || fulfillment.assistedEnabled === false) {
    return 0;
  }

  const normalized = stateCode?.toUpperCase();
  const variant = normalized
    ? fulfillment.stateVariants.find((v) => v.stateCode === normalized)
    : undefined;

  if (variant?.platformFee != null) {
    return Number(variant.platformFee);
  }

  return Number(fulfillment.defaultPlatformFee ?? 0);
}

export function calculateAssistedTotalAmount(
  pricing: PricingLike,
  fulfillment: FulfillmentLike,
  stateCode?: string | null,
  baseFeeOverride?: number | null,
): number {
  const platformFee = resolveAssistedPlatformFee(fulfillment, stateCode);

  if (!pricing) {
    return platformFee;
  }

  const baseFee = baseFeeOverride ?? Number(pricing.baseFee);
  const taxRate = Number(pricing.taxRate);
  const taxAmount = pricing.taxEnabled ? (baseFee * taxRate) / 100 : 0;
  const additionalTotal = pricing.additionalCharges.reduce(
    (sum, charge) => sum + Number(charge.amount),
    0,
  );

  return baseFee + taxAmount + additionalTotal + platformFee;
}
