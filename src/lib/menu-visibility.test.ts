import { describe, expect, it } from "vitest";
import { sellableItems, type MenuRow } from "@/lib/menu-visibility";

function row(id: string, active: boolean, day: number): MenuRow {
  return {
    id,
    name: id,
    pricePaise: 1000,
    active,
    createdAt: new Date(Date.UTC(2026, 0, day)),
  };
}

describe("sellableItems", () => {
  it("drops hidden items", () => {
    const result = sellableItems([row("a", true, 1), row("b", false, 2)]);
    expect(result.map((r) => r.id)).toEqual(["a"]);
  });

  it("keeps creation order", () => {
    const result = sellableItems([row("late", true, 5), row("early", true, 1)]);
    expect(result.map((r) => r.id)).toEqual(["early", "late"]);
  });

  it("returns an empty list when everything is hidden", () => {
    expect(sellableItems([row("a", false, 1)])).toEqual([]);
  });

  it("does not mutate the input", () => {
    const input = [row("b", true, 2), row("a", true, 1)];
    sellableItems(input);
    expect(input.map((r) => r.id)).toEqual(["b", "a"]);
  });
});
