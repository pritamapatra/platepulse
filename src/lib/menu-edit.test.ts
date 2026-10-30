import { describe, expect, it } from "vitest";
import { setActiveSchema, updatePriceSchema } from "@/lib/menu";

const id = "5b0f3c1e-8d2a-4c47-9e61-0a1b2c3d4e5f";

describe("updatePriceSchema", () => {
  it("converts rupees to paise", () => {
    const r = updatePriceSchema.parse({ id, price: "12.50" });
    expect(r.price).toBe(1250);
  });

  it("rejects zero, blank and too-high prices", () => {
    expect(updatePriceSchema.safeParse({ id, price: "0" }).success).toBe(false);
    expect(updatePriceSchema.safeParse({ id, price: " " }).success).toBe(false);
    expect(updatePriceSchema.safeParse({ id, price: "100001" }).success).toBe(
      false,
    );
  });

  it("rejects a malformed id", () => {
    expect(updatePriceSchema.safeParse({ id: "x", price: "10" }).success).toBe(
      false,
    );
  });
});

describe("setActiveSchema", () => {
  it("parses true and false strings", () => {
    expect(setActiveSchema.parse({ id, active: "false" }).active).toBe(false);
    expect(setActiveSchema.parse({ id, active: "true" }).active).toBe(true);
  });

  it("rejects other values", () => {
    expect(setActiveSchema.safeParse({ id, active: "yes" }).success).toBe(
      false,
    );
  });
});
