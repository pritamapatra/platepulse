import { describe, expect, it } from "vitest";
import { isUniqueViolation } from "@/lib/db-errors";

const NAME = "menu_items_restaurant_name_uq";

describe("isUniqueViolation", () => {
  it("detects a direct unique violation", () => {
    expect(
      isUniqueViolation({ code: "23505", constraint_name: NAME }, NAME),
    ).toBe(true);
  });

  it("detects a violation wrapped in a cause", () => {
    const wrapped = new Error("query failed", {
      cause: { code: "23505", constraint_name: NAME },
    });
    expect(isUniqueViolation(wrapped, NAME)).toBe(true);
  });

  it("matches any constraint when none is given", () => {
    expect(isUniqueViolation({ code: "23505", constraint_name: "x" })).toBe(
      true,
    );
  });

  it("ignores a different constraint", () => {
    expect(
      isUniqueViolation({ code: "23505", constraint_name: "other" }, NAME),
    ).toBe(false);
  });

  it("ignores other error codes and non-objects", () => {
    expect(isUniqueViolation({ code: "23514" }, NAME)).toBe(false);
    expect(isUniqueViolation(null)).toBe(false);
    expect(isUniqueViolation("boom")).toBe(false);
  });
});
