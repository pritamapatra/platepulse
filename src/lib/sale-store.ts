import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { menuItems, saleLines, sales } from "@/db/schema";
import { businessDate } from "@/lib/business-date";
import { buildSale, saleInputSchema } from "@/lib/sale";

export type SaveSaleResult =
  | { ok: true; saleId: string; totalPaise: number; duplicate: boolean }
  | { ok: false; error: string };

export async function recordSale(
  context: { restaurantId: string; userId: string },
  input: unknown,
): Promise<SaveSaleResult> {
  const { restaurantId, userId } = context;

  const parsed = saleInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  const { clientRequestId, method, lines } = parsed.data;
  const ids = [...new Set(lines.map((line) => line.menuItemId))];

  try {
    return await db.transaction(async (tx): Promise<SaveSaleResult> => {
      const menu = await tx
        .select({
          id: menuItems.id,
          name: menuItems.name,
          pricePaise: menuItems.pricePaise,
          active: menuItems.active,
        })
        .from(menuItems)
        .where(
          and(
            eq(menuItems.restaurantId, restaurantId),
            inArray(menuItems.id, ids),
          ),
        );

      const built = buildSale(lines, menu);
      if (!built.ok) return { ok: false, error: built.error };

      const inserted = await tx
        .insert(sales)
        .values({
          restaurantId,
          createdBy: userId,
          clientRequestId,
          businessDate: businessDate(),
          paymentMethod: method,
          totalPaise: built.totalPaise,
        })
        .onConflictDoNothing({
          target: [sales.restaurantId, sales.clientRequestId],
        })
        .returning({ id: sales.id });

      if (inserted.length === 0) {
        const [existing] = await tx
          .select({
            id: sales.id,
            totalPaise: sales.totalPaise,
            deletedAt: sales.deletedAt,
          })
          .from(sales)
          .where(
            and(
              eq(sales.restaurantId, restaurantId),
              eq(sales.clientRequestId, clientRequestId),
            ),
          )
          .limit(1);
        if (!existing || existing.deletedAt) {
          return { ok: false, error: "That sale was undone. Start a new one." };
        }
        return {
          ok: true,
          saleId: existing.id,
          totalPaise: existing.totalPaise,
          duplicate: true,
        };
      }

      const saleId = inserted[0].id;
      await tx.insert(saleLines).values(
        built.lines.map((line) => ({
          saleId,
          menuItemId: line.menuItemId,
          nameSnapshot: line.nameSnapshot,
          unitPricePaise: line.unitPricePaise,
          quantity: line.quantity,
        })),
      );

      return {
        ok: true,
        saleId,
        totalPaise: built.totalPaise,
        duplicate: false,
      };
    });
  } catch {
    return { ok: false, error: "Not saved. Try again." };
  }
}
