import { asc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { db } from "@/db";
import { menuItems } from "@/db/schema";
import { formatPaise } from "@/lib/money";
import { homePathFor } from "@/lib/routes";
import { getSession } from "@/lib/session";
import { MenuForm } from "./menu-form";

export const metadata: Metadata = { title: "Menu" };

async function MenuContent() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "owner") redirect(homePathFor(session.role));

  const items = await db
    .select({
      id: menuItems.id,
      name: menuItems.name,
      pricePaise: menuItems.pricePaise,
    })
    .from(menuItems)
    .where(eq(menuItems.restaurantId, session.restaurantId))
    .orderBy(asc(menuItems.createdAt));

  return (
    <div className="space-y-8">
      <MenuForm />
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-ink-900">Items</h2>
        {items.length === 0 ? (
          <p className="text-ink-600">No items yet. Add your first item.</p>
        ) : (
          <ul className="divide-y divide-ink-300 border-y border-ink-300">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex min-h-11 items-center justify-between gap-4 py-2"
              >
                <span className="text-ink-900">{item.name}</span>
                <span className="tabular-nums text-ink-600">
                  {formatPaise(item.pricePaise)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function MenuPage() {
  return (
    <main className="mx-auto w-full max-w-[720px] space-y-6 p-4 md:p-6">
      <h1 className="text-xl font-semibold text-ink-900">Menu</h1>
      <Suspense fallback={<div className="h-6 w-48 bg-surface-subtle" />}>
        <MenuContent />
      </Suspense>
    </main>
  );
}
