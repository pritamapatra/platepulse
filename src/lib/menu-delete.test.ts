import { describe, expect, it } from "vitest";
import { deleteItemSchema } from "@/lib/menu";

describe("deleteItemSchema", () => {
  it("accepts a uuid", () => {
    const id = "5b0f3c1e-8d2a-4c47-9e61-0a1b2c3d4e5f";
    expect(deleteItemSchema.parse({ id }).id).toBe(id);
  });

  it("rejects a malformed or missing id", () => {
    expect(deleteItemSchema.safeParse({ id: "x" }).success).toBe(false);
    expect(deleteItemSchema.safeParse({}).success).toBe(false);
  });
});
