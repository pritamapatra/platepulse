import { describe, expect, it } from "vitest";
import { menuItemSchema } from "@/lib/menu";

function parse(name: string, price: string) {
  return menuItemSchema.safeParse({ name, price });
}

describe("menuItemSchema", () => {
  it("converts rupees to integer paise", () => {
    expect(parse("Tea", "10")).toMatchObject({
      success: true,
      data: { name: "Tea", price: 1000 },
    });
    expect(parse("Samosa", "12.50")).toMatchObject({
      success: true,
      data: { price: 1250 },
    });
  });

  it("trims the name", () => {
    expect(parse("  Tea  ", "10")).toMatchObject({
      success: true,
      data: { name: "Tea" },
    });
  });

  it.each(["", "0", "-5", "abc", "0.00"])("rejects price %j", (price) => {
    expect(parse("Tea", price).success).toBe(false);
  });

  it("rejects a price above the cap", () => {
    expect(parse("Tea", "100001").success).toBe(false);
  });

  it("rejects an empty or overlong name", () => {
    expect(parse("   ", "10").success).toBe(false);
    expect(parse("x".repeat(61), "10").success).toBe(false);
  });
});
