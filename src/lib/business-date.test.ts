import { describe, expect, it } from "vitest";
import { businessDate } from "./business-date";

describe("businessDate", () => {
  it("keeps 11:50 pm IST on the same date", () => {
    expect(businessDate(new Date("2026-10-29T18:20:00Z"))).toBe("2026-10-29");
  });
  it("rolls over at midnight IST", () => {
    expect(businessDate(new Date("2026-10-29T18:29:59Z"))).toBe("2026-10-29");
    expect(businessDate(new Date("2026-10-29T18:30:00Z"))).toBe("2026-10-30");
  });
  it("differs from the UTC date after midnight IST", () => {
    expect(businessDate(new Date("2026-10-29T18:40:00Z"))).toBe("2026-10-30");
  });
  it("handles early morning IST", () => {
    expect(businessDate(new Date("2026-10-29T00:30:00Z"))).toBe("2026-10-29");
  });
  it("rejects invalid dates", () => {
    expect(() => businessDate(new Date("nope"))).toThrow();
  });
});
