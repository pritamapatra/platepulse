import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { logOut } from "@/app/account/actions";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Sell" };

async function SellPlaceholder() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="space-y-4">
      <p className="text-ink-600">Signed in as {session.email}</p>
      <p className="text-ink-600">The sales screen arrives in a later task.</p>
      <form action={logOut}>
        <Button type="submit" variant="outline" className="h-[52px] w-full">
          Sign out
        </Button>
      </form>
    </div>
  );
}

export default function SellPage() {
  return (
    <main className="mx-auto w-full max-w-[720px] space-y-6 p-4 md:p-6">
      <h1 className="text-xl font-semibold text-ink-900">Sell</h1>
      <Suspense fallback={<div className="h-6 w-48 bg-surface-subtle" />}>
        <SellPlaceholder />
      </Suspense>
    </main>
  );
}
