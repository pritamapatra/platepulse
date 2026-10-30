import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { logOut } from "./actions";

export const metadata: Metadata = { title: "Account" };

async function AccountDetails() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  return (
    <div className="space-y-4">
      <p className="text-ink-600">Signed in as {String(data.claims.email)}</p>
      <form action={logOut}>
        <Button type="submit" variant="outline" className="h-[52px] w-full">
          Sign out
        </Button>
      </form>
    </div>
  );
}

export default function AccountPage() {
  return (
    <main className="mx-auto w-full max-w-[720px] space-y-6 p-4 md:p-6">
      <h1 className="text-xl font-semibold text-ink-900">Account</h1>
      <Suspense fallback={<div className="h-6 w-48 bg-surface-subtle" />}>
        <AccountDetails />
      </Suspense>
    </main>
  );
}
