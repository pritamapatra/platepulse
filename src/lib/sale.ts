import { z } from "zod";
import { MAX_QTY } from "@/lib/cart";
import { PAYMENT_METHODS } from "@/lib/payment";

const MAX_LINES = 100;
const MAX_SALE_PAISE = 100_000_000;

export const saleInputSchema = z.object({
  clientRequestId: z.uuid("Invalid request"),
  method: z.enum(PAYMENT_METHODS, "Choose Cash or UPI"),
  lines: z
    .array(
      z.object({
        menuItemId: z.uuid("Invalid item"),
        quantity: z.number().int().min(1).max(MAX_QTY),
      }),
    )
    .min(1, "Add at least one item")
    .max(MAX_LINES, "Too many items"),
});

export type SaleInput = z.infer<typeof saleInputSchema>;

export type MenuRow = {
  id: string;
  name: string;
  pricePaise: number;
  active: boolean;
};

export type SaleLine = {
  menuItemId: string;
  nameSnapshot: string;
  unitPricePaise: number;
  quantity: number;
};

export type BuiltSale =
  | { ok: true; lines: SaleLine[]; totalPaise: number }
  | { ok: false; error: string };

export function buildSale(
  input: SaleInput["lines"],
  menu: readonly MenuRow[],
): BuiltSale {
  const quantities = new Map<string, number>();
  for (const line of input) {
    quantities.set(
      line.menuItemId,
      (quantities.get(line.menuItemId) ?? 0) + line.quantity,
    );
  }

  const byId = new Map(menu.map((row) => [row.id, row]));
  const lines: SaleLine[] = [];
  let totalPaise = 0;

  for (const [menuItemId, quantity] of quantities) {
    const row = byId.get(menuItemId);
    if (!row || !row.active) {
      return {
        ok: false,
        error: "Some items are no longer available. Refresh and try again.",
      };
    }
    if (quantity > MAX_QTY) {
      return { ok: false, error: "Quantity is too high for one item" };
    }
    lines.push({
      menuItemId,
      nameSnapshot: row.name,
      unitPricePaise: row.pricePaise,
      quantity,
    });
    totalPaise += row.pricePaise * quantity;
  }

  if (totalPaise > MAX_SALE_PAISE) {
    return { ok: false, error: "Sale is too large" };
  }
  return { ok: true, lines, totalPaise };
}
