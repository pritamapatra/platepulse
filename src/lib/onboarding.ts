import { eq } from "drizzle-orm";
import { db } from "@/db";
import { memberships, restaurants } from "@/db/schema";

export async function createRestaurantForOwner(userId: string, name: string) {
  return db.transaction(async (tx) => {
    const existing = await tx
      .select({ restaurantId: memberships.restaurantId })
      .from(memberships)
      .where(eq(memberships.userId, userId))
      .limit(1);
    if (existing.length > 0) return existing[0].restaurantId;

    const [restaurant] = await tx
      .insert(restaurants)
      .values({ name })
      .returning({ id: restaurants.id });
    await tx
      .insert(memberships)
      .values({ restaurantId: restaurant.id, userId, role: "owner" });
    return restaurant.id;
  });
}
