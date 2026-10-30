import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { logOut } from "./actions";
import { CashierForm } from "./cashier-form";

export const metadata: Metadata = { title: "Account" };

async function AccountDetails() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <p className="text-ink-600">Signed in as {session.email}</p>
        <p className="text-ink-600">Role: {session.role}</p>
      </div>
      {session.role === "owner" ? (
        <>
          <Link
            href="/menu"
            className="flex h-[52px] w-full items-center justify-center rounded-[8px] border border-ink-300 text-ink-900"
          >
            Menu
          </Link>
          <CashierForm />
        </>
      ) : null}
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
