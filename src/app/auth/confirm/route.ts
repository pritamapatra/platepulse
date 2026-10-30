import { NextResponse } from "next/server";
import { createRestaurantForOwner } from "@/lib/onboarding";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const meta = data.user.user_metadata?.restaurant_name;
      const name =
        typeof meta === "string" && meta.trim() ? meta.trim() : "My restaurant";
      try {
        await createRestaurantForOwner(data.user.id, name);
        return NextResponse.redirect(`${origin}/`);
      } catch (e) {
        console.error("[confirm] onboarding failed:", e);
      }
    }
  }

  return NextResponse.redirect(`${origin}/signup`);
}
