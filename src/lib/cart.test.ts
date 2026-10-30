import { describe, expect, it } from "vitest";
import {
  MAX_QTY,
  addToCart,
  cartItemCount,
  cartTotalPaise,
  pruneCart,
  removeFromCart,
  type Cart,
} from "@/lib/cart";

const prices = { tea: 1000, samosa: 1500 };

describe("addToCart", () => {
  it("adds and increments", () => {
    const cart = addToCart(addToCart({}, "tea"), "tea");
    expect(cart).toEqual({ tea: 2 });
  });

  it("stops at the maximum quantity", () => {
    let cart: Cart = {};
    for (let i = 0; i < MAX_QTY + 5; i++) cart = addToCart(cart, "tea");
    expect(cart.tea).toBe(MAX_QTY);
  });

  it("does not mutate the input", () => {
    const cart: Cart = Object.freeze({ tea: 1 });
    addToCart(cart, "tea");
    expect(cart).toEqual({ tea: 1 });
  });
});

describe("removeFromCart", () => {
  it("decrements", () => {
    expect(removeFromCart({ tea: 2 }, "tea")).toEqual({ tea: 1 });
  });

  it("removes the line at zero", () => {
    expect(removeFromCart({ tea: 1 }, "tea")).toEqual({});
  });

  it("ignores items not in the cart", () => {
    const cart: Cart = { tea: 1 };
    expect(removeFromCart(cart, "samosa")).toBe(cart);
  });
});

describe("cartTotalPaise", () => {
  it("totals two Rs 10 teas as Rs 20", () => {
    expect(cartTotalPaise({ tea: 2 }, prices)).toBe(2000);
  });

  it("sums mixed lines", () => {
    expect(cartTotalPaise({ tea: 2, samosa: 1 }, prices)).toBe(3500);
  });

  it("ignores ids with no price", () => {
    expect(cartTotalPaise({ tea: 1, ghost: 3 }, prices)).toBe(1000);
  });

  it("is zero for an empty cart", () => {
    expect(cartTotalPaise({}, prices)).toBe(0);
  });
});

describe("cartItemCount", () => {
  it("sums quantities", () => {
    expect(cartItemCount({ tea: 2, samosa: 3 })).toBe(5);
  });
});

describe("pruneCart", () => {
  it("drops items that left the menu", () => {
    const result = pruneCart({ tea: 2, samosa: 1 }, new Set(["tea"]));
    expect(result).toEqual({ tea: 2 });
  });

  it("returns the same cart when nothing changed", () => {
    const cart: Cart = { tea: 1 };
    expect(pruneCart(cart, new Set(["tea", "samosa"]))).toBe(cart);
  });
});
