"use server";

import { AuthError, requireRole } from "@/lib/guards";
import { recordSale, type SaveSaleResult } from "@/lib/sale-store";

export async function saveSale(input: unknown): Promise<SaveSaleResult> {
  let session;
  try {
    session = await requireRole("owner", "cashier");
  } catch (error) {
    if (error instanceof AuthError) return { ok: false, error: error.message };
    throw error;
  }
  return recordSale(
    { restaurantId: session.restaurantId, userId: session.userId },
    input,
  );
}
