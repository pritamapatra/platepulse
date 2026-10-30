import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { dailyCloses } from "@/db/schema";

export async function getOpeningCash(
  restaurantId: string,
  date: string,
): Promise<number | null> {
  const rows = await db
    .select({ openingCashPaise: dailyCloses.openingCashPaise })
    .from(dailyCloses)
    .where(
      and(
        eq(dailyCloses.restaurantId, restaurantId),
        eq(dailyCloses.businessDate, date),
      ),
    )
    .limit(1);
  return rows[0]?.openingCashPaise ?? null;
}
