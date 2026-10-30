import { eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { memberships } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

export type Role = "owner" | "cashier";

export type AppSession = {
  userId: string;
  email: string | null;
  restaurantId: string;
  role: Role;
};

export async function getMembership(userId: string) {
  const rows = await db
    .select({
      restaurantId: memberships.restaurantId,
      role: memberships.role,
    })
    .from(memberships)
    .where(eq(memberships.userId, userId))
    .orderBy(memberships.createdAt)
    .limit(1);
  return rows[0] ?? null;
}

export const getSession = cache(async (): Promise<AppSession | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  const membership = await getMembership(claims.sub);
  if (!membership) return null;

  return {
    userId: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
    restaurantId: membership.restaurantId,
    role: membership.role,
  };
});
