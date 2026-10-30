import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { menuItems } from "@/db/schema";
import { sellableItems } from "@/lib/menu-visibility";

export async function listAllMenuItems(restaurantId: string) {
  return db
    .select({
      id: menuItems.id,
      name: menuItems.name,
      pricePaise: menuItems.pricePaise,
      active: menuItems.active,
      createdAt: menuItems.createdAt,
    })
    .from(menuItems)
    .where(eq(menuItems.restaurantId, restaurantId))
    .orderBy(asc(menuItems.createdAt));
}

export async function listSellableItems(restaurantId: string) {
  return sellableItems(await listAllMenuItems(restaurantId));
}
