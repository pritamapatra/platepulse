"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { menuItems } from "@/db/schema";
import { isUniqueViolation } from "@/lib/db-errors";
import { AuthError, requireRole } from "@/lib/guards";
import { menuItemSchema } from "@/lib/menu";

export type MenuState = {
  error?: string;
  added?: string;
};

export async function addMenuItem(
  _prev: MenuState,
  formData: FormData,
): Promise<MenuState> {
  let restaurantId: string;
  try {
    ({ restaurantId } = await requireRole("owner"));
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message };
    throw error;
  }

  const parsed = menuItemSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, price } = parsed.data;
  try {
    await db
      .insert(menuItems)
      .values({ restaurantId, name, pricePaise: price });
  } catch (error) {
    if (isUniqueViolation(error, "menu_items_restaurant_name_uq")) {
      return { error: "That item already exists" };
    }
    return { error: "Not saved. Try again." };
  }

  revalidatePath("/menu");
  return { added: name };
}
