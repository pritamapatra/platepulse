"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type SignUpState = {
  error?: string;
  sent?: boolean;
  email?: string;
};

const schema = z.object({
  restaurantName: z.string().trim().min(1, "Enter your restaurant name"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters"),
});

export async function signUp(
  _prev: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const parsed = schema.safeParse({
    restaurantName: formData.get("restaurantName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { restaurantName, email, password } = parsed.data;
  const origin = (await headers()).get("origin");
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
      data: { restaurant_name: restaurantName },
    },
  });
  if (error) {
    return { error: error.message };
  }

  return { sent: true, email };
}
