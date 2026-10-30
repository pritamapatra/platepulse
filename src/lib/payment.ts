export const PAYMENT_METHODS = ["cash", "upi"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  upi: "UPI",
};

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    typeof value === "string" &&
    (PAYMENT_METHODS as readonly string[]).includes(value)
  );
}

export function canSaveSale(input: {
  totalPaise: number;
  method: PaymentMethod | null;
}): boolean {
  return input.totalPaise > 0 && input.method !== null;
}
