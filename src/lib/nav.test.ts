import { describe, expect, it } from "vitest";
import { isActiveTab, tabsFor } from "@/lib/nav";

describe("tabsFor", () => {
  it("gives a cashier three tabs", () => {
    expect(tabsFor("cashier").map((t) => t.label)).toEqual([
      "Sell",
      "Add",
      "Close",
    ]);
  });

  it("gives an owner four tabs", () => {
    expect(tabsFor("owner").map((t) => t.label)).toEqual([
      "Today",
      "Review",
      "Suppliers",
      "Reports",
    ]);
  });

  it("never shares a destination between roles", () => {
    const cashier = tabsFor("cashier").map((t) => t.href);
    const owner = tabsFor("owner").map((t) => t.href);
    expect(cashier.filter((href) => owner.includes(href))).toEqual([]);
  });
});

describe("isActiveTab", () => {
  it("matches the exact path and nested paths", () => {
    expect(isActiveTab("/sell", "/sell")).toBe(true);
    expect(isActiveTab("/sell/history", "/sell")).toBe(true);
  });

  it("does not match a longer sibling path", () => {
    expect(isActiveTab("/seller", "/sell")).toBe(false);
  });
});
