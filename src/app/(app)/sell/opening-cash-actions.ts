"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { auditEvents, dailyCloses } from "@/db/schema";
import { businessDate } from "@/lib/business-date";
import { AuthError, requireRole } from "@/lib/guards";
import { openingCashSchema } from "@/lib/opening-cash";

export type OpeningCashState = {
  error?: string;
  saved?: boolean;
};

export async function saveOpeningCash(
  _prev: OpeningCashState,
  formData: FormData,
): Promise<OpeningCashState> {
  let restaurantId: string;
  let userId: string;
  try {
    ({ restaurantId, userId } = await requireRole("owner", "cashier"));
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message };
    throw error;
  }

  const parsed = openingCashSchema.safeParse({
    amount: formData.get("amount"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const date = businessDate();
  const amountPaise = parsed.data.amount;

  try {
    const created = await db.transaction(async (tx) => {
      const rows = await tx
        .insert(dailyCloses)
        .values({
          restaurantId,
          businessDate: date,
          openingCashPaise: amountPaise,
        })
        .onConflictDoNothing({
          target: [dailyCloses.restaurantId, dailyCloses.businessDate],
        })
        .returning({ id: dailyCloses.id });
      if (rows.length === 0) return false;

      await tx.insert(auditEvents).values({
        restaurantId,
        actorId: userId,
        action: "opening_cash.set",
        entityType: "daily_close",
        entityId: rows[0].id,
        metadata: { businessDate: date, openingCashPaise: amountPaise },
      });
      return true;
    });
    if (!created) return { error: "Opening cash is already set for today" };
  } catch {
    return { error: "Not saved. Try again." };
  }

  revalidatePath("/sell");
  return { saved: true };
}
