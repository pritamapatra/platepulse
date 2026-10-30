import { describe, expect, it } from "vitest";
import { openingCashSchema } from "@/lib/opening-cash";

const parse = (amount: string) => openingCashSchema.safeParse({ amount });

describe("openingCashSchema", () => {
  it("converts rupees to paise", () => {
    const r = openingCashSchema.parse({ amount: "5000" });
    expect(r.amount).toBe(500000);
  });

  it("accepts zero", () => {
    expect(openingCashSchema.parse({ amount: "0" }).amount).toBe(0);
  });

  it("accepts decimals", () => {
    expect(openingCashSchema.parse({ amount: "250.50" }).amount).toBe(25050);
  });

  it("rejects blank, text and negative values", () => {
    expect(parse(" ").success).toBe(false);
    expect(parse("abc").success).toBe(false);
    expect(parse("-1").success).toBe(false);
  });

  it("rejects amounts above the limit", () => {
    expect(parse("1000001").success).toBe(false);
  });
});
