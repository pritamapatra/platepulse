import { describe, expect, it } from "vitest";
import { isForeignKeyViolation } from "@/lib/db-errors";

const NAME = "sale_lines_menu_item_id_menu_items_id_fk";

describe("isForeignKeyViolation", () => {
  it("detects a direct foreign key violation", () => {
    expect(
      isForeignKeyViolation({ code: "23503", constraint_name: NAME }, NAME),
    ).toBe(true);
  });

  it("detects a violation wrapped in a cause", () => {
    const wrapped = new Error("query failed", {
      cause: { code: "23503", constraint_name: NAME },
    });
    expect(isForeignKeyViolation(wrapped, NAME)).toBe(true);
  });

  it("ignores a different constraint", () => {
    expect(
      isForeignKeyViolation({ code: "23503", constraint_name: "x" }, NAME),
    ).toBe(false);
  });

  it("does not treat a unique violation as a foreign key violation", () => {
    expect(isForeignKeyViolation({ code: "23505" })).toBe(false);
    expect(isForeignKeyViolation(null)).toBe(false);
  });
});
