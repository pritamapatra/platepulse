import type { Cart } from "@/lib/cart";
import type { PaymentMethod } from "@/lib/payment";

export type Attempt = { id: string; signature: string } | null;

export function cartSignature(cart: Cart, method: PaymentMethod | null) {
  const lines = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return JSON.stringify({ method, lines });
}

export function nextAttempt(
  previous: Attempt,
  signature: string,
  newId: () => string,
): { id: string; signature: string } {
  if (previous && previous.signature === signature) return previous;
  return { id: newId(), signature };
}
