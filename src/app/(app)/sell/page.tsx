import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { logOut } from "@/app/(app)/account/actions";
import { Button } from "@/components/ui/button";
import { businessDate } from "@/lib/business-date";
import { getOpeningCash } from "@/lib/daily-close-queries";
import { listSellableItems } from "@/lib/menu-queries";
import { formatPaise } from "@/lib/money";
import { getSession } from "@/lib/session";
import { OpeningCashForm } from "./opening-cash-form";
import { SellGrid } from "./sell-grid";
import { SellRefresher } from "./sell-refresher";

export const metadata: Metadata = { title: "Sell" };

async function SellContent() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [opening, items] = await Promise.all([
    getOpeningCash(session.restaurantId, businessDate()),
    listSellableItems(session.restaurantId),
  ]);

  return (
    <div className="space-y-6">
      <SellRefresher />
      <section className="border-b border-ink-300 pb-4">
        {opening === null ? (
          <OpeningCashForm />
        ) : (
          <p className="text-ink-900">
            Opening cash today:{" "}
            <span className="font-semibold tabular-nums">
              {formatPaise(opening)}
            </span>
          </p>
        )}
      </section>
      <SellGrid
        items={items.map((item) => ({
          id: item.id,
          name: item.name,
          pricePaise: item.pricePaise,
        }))}
        isOwner={session.role === "owner"}
      />
      <div className="space-y-4 border-t border-ink-300 pt-4">
        <p className="text-ink-600">Signed in as {session.email}</p>
        <form action={logOut}>
          <Button type="submit" variant="outline" className="h-[52px] w-full">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function SellPage() {
  return (
    <main className="mx-auto w-full max-w-[720px] space-y-6 p-4 md:p-6">
      <h1 className="text-xl font-semibold text-ink-900">Sell</h1>
      <Suspense fallback={<div className="h-6 w-48 bg-surface-subtle" />}>
        <SellContent />
      </Suspense>
    </main>
  );
}
