"use server";

import { z } from "zod";
import { db } from "@/db";
import { memberships } from "@/db/schema";
import { createCashierAccount } from "@/lib/cashiers";
import { AuthError, requireRole } from "@/lib/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export type CashierState = {
  error?: string;
  created?: string;
};

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters"),
});

export async function addCashier(
  _prev: CashierState,
  formData: FormData,
): Promise<CashierState> {
  let restaurantId: string;
  try {
    ({ restaurantId } = await requireRole("owner"));
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message };
    throw error;
  }

  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { email, password } = parsed.data;
  const admin = createAdminClient();

  const result = await createCashierAccount(
    { restaurantId, email, password },
    {
      createAuthUser: async (userEmail, userPassword) => {
        const { data, error } = await admin.auth.admin.createUser({
          email: userEmail,
          password: userPassword,
          email_confirm: true,
        });
        if (error || !data.user) {
          return { error: error?.message ?? "Could not create the user" };
        }
        return { id: data.user.id };
      },
      addCashierMembership: async (userId, targetRestaurantId) => {
        await db
          .insert(memberships)
          .values({
            restaurantId: targetRestaurantId,
            userId,
            role: "cashier",
          });
      },
      deleteAuthUser: async (userId) => {
        await admin.auth.admin.deleteUser(userId);
      },
    },
  );

  return result.ok ? { created: email } : { error: result.error };
}
