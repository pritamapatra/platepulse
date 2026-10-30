import { describe, expect, it } from "vitest";
import { buildSale, saleInputSchema, type MenuRow } from "@/lib/sale";

const TEA = "5b0f3c1e-8d2a-4c47-9e61-0a1b2c3d4e5f";
const SAMOSA = "6c1a4d2f-9e3b-4d58-8f72-1b2c3d4e5f60";
const GHOST = "7d2b5e30-af4c-4e69-9083-2c3d4e5f6071";
const REQUEST = "8e3c6f41-b05d-4f7a-a194-3d4e5f607182";

const menu: MenuRow[] = [
  { id: TEA, name: "Tea", pricePaise: 1000, active: true },
  { id: SAMOSA, name: "Samosa", pricePaise: 1500, active: false },
];

describe("saleInputSchema", () => {
  const base = {
    clientRequestId: REQUEST,
    method: "cash",
    lines: [{ menuItemId: TEA, quantity: 2 }],
  };

  it("accepts a valid sale", () => {
    expect(saleInputSchema.safeParse(base).success).toBe(true);
  });

  it("drops a tampered client total", () => {
    const parsed = saleInputSchema.parse({ ...base, totalPaise: 1 });
    expect("totalPaise" in parsed).toBe(false);
  });

  it("rejects credit and missing methods", () => {
    expect(
      saleInputSchema.safeParse({ ...base, method: "credit" }).success,
    ).toBe(false);
    expect(
      saleInputSchema.safeParse({ ...base, method: undefined }).success,
    ).toBe(false);
  });

  it("rejects empty carts and bad quantities", () => {
    expect(saleInputSchema.safeParse({ ...base, lines: [] }).success).toBe(
      false,
    );
    for (const quantity of [0, -1, 1.5, 100]) {
      const lines = [{ menuItemId: TEA, quantity }];
      expect(saleInputSchema.safeParse({ ...base, lines }).success).toBe(false);
    }
  });

  it("rejects a malformed request id", () => {
    expect(
      saleInputSchema.safeParse({ ...base, clientRequestId: "x" }).success,
    ).toBe(false);
  });
});

describe("buildSale", () => {
  it("prices lines from the database, snapshotting name and price", () => {
    const result = buildSale([{ menuItemId: TEA, quantity: 2 }], menu);
    expect(result).toEqual({
      ok: true,
      totalPaise: 2000,
      lines: [
        {
          menuItemId: TEA,
          nameSnapshot: "Tea",
          unitPricePaise: 1000,
          quantity: 2,
        },
      ],
    });
  });

  it("merges duplicate lines", () => {
    const result = buildSale(
      [
        { menuItemId: TEA, quantity: 1 },
        { menuItemId: TEA, quantity: 2 },
      ],
      menu,
    );
    expect(result.ok && result.lines).toHaveLength(1);
    expect(result.ok && result.totalPaise).toBe(3000);
  });

  it("rejects hidden items", () => {
    expect(buildSale([{ menuItemId: SAMOSA, quantity: 1 }], menu).ok).toBe(
      false,
    );
  });

  it("rejects unknown items", () => {
    expect(buildSale([{ menuItemId: GHOST, quantity: 1 }], menu).ok).toBe(
      false,
    );
  });

  it("fails the whole sale if any line is unavailable", () => {
    const result = buildSale(
      [
        { menuItemId: TEA, quantity: 1 },
        { menuItemId: SAMOSA, quantity: 1 },
      ],
      menu,
    );
    expect(result.ok).toBe(false);
  });

  it("rejects merged quantities above the maximum", () => {
    const result = buildSale(
      [
        { menuItemId: TEA, quantity: 60 },
        { menuItemId: TEA, quantity: 60 },
      ],
      menu,
    );
    expect(result.ok).toBe(false);
  });

  it("rejects oversized sales", () => {
    const big: MenuRow[] = [
      { id: TEA, name: "Feast", pricePaise: 10_000_000, active: true },
    ];
    expect(buildSale([{ menuItemId: TEA, quantity: 11 }], big).ok).toBe(false);
  });
});
