export type Cart = Readonly<Record<string, number>>;

export const MAX_QTY = 99;

export function addToCart(cart: Cart, id: string): Cart {
  const current = cart[id] ?? 0;
  if (current >= MAX_QTY) return cart;
  return { ...cart, [id]: current + 1 };
}

export function removeFromCart(cart: Cart, id: string): Cart {
  const current = cart[id];
  if (!current) return cart;
  if (current <= 1) {
    const next = { ...cart };
    delete next[id];
    return next;
  }
  return { ...cart, [id]: current - 1 };
}

export function pruneCart(cart: Cart, validIds: ReadonlySet<string>): Cart {
  const ids = Object.keys(cart);
  if (ids.every((id) => validIds.has(id))) return cart;
  const next: Record<string, number> = {};
  for (const id of ids) {
    if (validIds.has(id)) next[id] = cart[id];
  }
  return next;
}

export function cartTotalPaise(
  cart: Cart,
  prices: Readonly<Record<string, number>>,
): number {
  let total = 0;
  for (const [id, qty] of Object.entries(cart)) {
    const price = prices[id];
    if (price === undefined) continue;
    total += price * qty;
  }
  return total;
}

export function cartItemCount(cart: Cart): number {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}
