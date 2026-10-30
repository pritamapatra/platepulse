"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { homePathFor } from "@/lib/routes";
import { getMembership } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string };

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export async function logIn(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    return { error: "Wrong email or password" };
  }

  const membership = await getMembership(data.user.id);
  redirect(membership ? homePathFor(membership.role) : "/account");
}
