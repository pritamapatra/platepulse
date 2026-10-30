import { describe, expect, it } from "vitest";
import { paymentMethod } from "@/db/schema";
import {
  PAYMENT_LABELS,
  PAYMENT_METHODS,
  canSaveSale,
  isPaymentMethod,
} from "@/lib/payment";

describe("PAYMENT_METHODS", () => {
  it("matches the database enum", () => {
    expect([...PAYMENT_METHODS]).toEqual([...paymentMethod.enumValues]);
  });

  it("has a label for every method", () => {
    for (const method of PAYMENT_METHODS) {
      expect(PAYMENT_LABELS[method]).toBeTruthy();
    }
  });
});

describe("isPaymentMethod", () => {
  it("accepts cash and upi", () => {
    expect(isPaymentMethod("cash")).toBe(true);
    expect(isPaymentMethod("upi")).toBe(true);
  });

  it("rejects credit, blanks and non-strings", () => {
    expect(isPaymentMethod("credit")).toBe(false);
    expect(isPaymentMethod("")).toBe(false);
    expect(isPaymentMethod(null)).toBe(false);
  });
});

describe("canSaveSale", () => {
  it("is false without a method", () => {
    expect(canSaveSale({ totalPaise: 2000, method: null })).toBe(false);
  });

  it("is false for an empty cart", () => {
    expect(canSaveSale({ totalPaise: 0, method: "cash" })).toBe(false);
  });

  it("is true with items and a method", () => {
    expect(canSaveSale({ totalPaise: 2000, method: "upi" })).toBe(true);
  });
});
