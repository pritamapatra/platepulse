import { describe, expect, it } from "vitest";
import { formatPaise, rupeesToPaise } from "./money";

describe("rupeesToPaise", () => {
  it("converts whole rupees", () => {
    expect(rupeesToPaise("1250")).toBe(125000);
  });
  it("converts fractions", () => {
    expect(rupeesToPaise("0.5")).toBe(50);
    expect(rupeesToPaise("0.50")).toBe(50);
    expect(rupeesToPaise("19.99")).toBe(1999);
  });
  it("accepts symbol and commas", () => {
    expect(rupeesToPaise("₹1,250")).toBe(125000);
  });
  it("rejects bad input", () => {
    for (const bad of ["", "abc", "12.345", "-5", "1.2.3"]) {
      expect(() => rupeesToPaise(bad)).toThrow();
    }
  });
});

describe("formatPaise", () => {
  it("formats whole rupees without decimals", () => {
    expect(formatPaise(125000)).toBe("₹1,250");
  });
  it("shows paise when present", () => {
    expect(formatPaise(50)).toBe("₹0.50");
    expect(formatPaise(1999)).toBe("₹19.99");
  });
  it("uses Indian grouping", () => {
    expect(formatPaise(12345600)).toBe("₹1,23,456");
  });
  it("handles zero and negatives", () => {
    expect(formatPaise(0)).toBe("₹0");
    expect(formatPaise(-30000)).toBe("-₹300");
  });
  it("rejects non-integers", () => {
    expect(() => formatPaise(10.5)).toThrow();
  });
});
