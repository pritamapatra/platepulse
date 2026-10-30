"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { menuItems } from "@/db/schema";
import { isForeignKeyViolation, isUniqueViolation } from "@/lib/db-errors";
import { AuthError, requireRole } from "@/lib/guards";
import {
  deleteItemSchema,
  menuItemSchema,
  setActiveSchema,
  updatePriceSchema,
} from "@/lib/menu";

export type MenuState = {
  error?: string;
  added?: string;
  saved?: boolean;
};

async function ownerRestaurantId(): Promise<
  { restaurantId: string } | { error: string }
> {
  try {
    const { restaurantId } = await requireRole("owner");
    return { restaurantId };
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message };
    throw error;
  }
}

export async function addMenuItem(
  _prev: MenuState,
  formData: FormData,
): Promise<MenuState> {
  const auth = await ownerRestaurantId();
  if ("error" in auth) return { error: auth.error };

  const parsed = menuItemSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, price } = parsed.data;
  try {
    await db
      .insert(menuItems)
      .values({ restaurantId: auth.restaurantId, name, pricePaise: price });
  } catch (error) {
    if (isUniqueViolation(error, "menu_items_restaurant_name_uq")) {
      return { error: "That item already exists" };
    }
    return { error: "Not saved. Try again." };
  }

  revalidatePath("/menu");
  return { added: name };
}

export async function updateMenuItemPrice(
  _prev: MenuState,
  formData: FormData,
): Promise<MenuState> {
  const auth = await ownerRestaurantId();
  if ("error" in auth) return { error: auth.error };

  const parsed = updatePriceSchema.safeParse({
    id: formData.get("id"),
    price: formData.get("price"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const rows = await db
      .update(menuItems)
      .set({ pricePaise: parsed.data.price })
      .where(
        and(
          eq(menuItems.id, parsed.data.id),
          eq(menuItems.restaurantId, auth.restaurantId),
        ),
      )
      .returning({ id: menuItems.id });
    if (rows.length === 0) return { error: "Item not found" };
  } catch {
    return { error: "Not saved. Try again." };
  }

  revalidatePath("/menu");
  revalidatePath("/sell");
  return { saved: true };
}

export async function setMenuItemActive(
  _prev: MenuState,
  formData: FormData,
): Promise<MenuState> {
  const auth = await ownerRestaurantId();
  if ("error" in auth) return { error: auth.error };

  const parsed = setActiveSchema.safeParse({
    id: formData.get("id"),
    active: formData.get("active"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const rows = await db
      .update(menuItems)
      .set({ active: parsed.data.active })
      .where(
        and(
          eq(menuItems.id, parsed.data.id),
          eq(menuItems.restaurantId, auth.restaurantId),
        ),
      )
      .returning({ id: menuItems.id });
    if (rows.length === 0) return { error: "Item not found" };
  } catch {
    return { error: "Not saved. Try again." };
  }

  revalidatePath("/menu");
  revalidatePath("/sell");
  return { saved: true };
}

export async function deleteMenuItem(
  _prev: MenuState,
  formData: FormData,
): Promise<MenuState> {
  const auth = await ownerRestaurantId();
  if ("error" in auth) return { error: auth.error };

  const parsed = deleteItemSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const rows = await db
      .delete(menuItems)
      .where(
        and(
          eq(menuItems.id, parsed.data.id),
          eq(menuItems.restaurantId, auth.restaurantId),
        ),
      )
      .returning({ id: menuItems.id });
    if (rows.length === 0) return { error: "Item not found" };
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return { error: "This item has sales. Hide it instead." };
    }
    return { error: "Not deleted. Try again." };
  }

  revalidatePath("/menu");
  revalidatePath("/sell");
  return { saved: true };
}
