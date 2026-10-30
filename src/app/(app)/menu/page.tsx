import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { listAllMenuItems } from "@/lib/menu-queries";
import { homePathFor } from "@/lib/routes";
import { getSession } from "@/lib/session";
import { MenuForm } from "./menu-form";
import { MenuItemRow } from "./menu-item-row";

export const metadata: Metadata = { title: "Menu" };

async function MenuContent() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "owner") redirect(homePathFor(session.role));

  const items = await listAllMenuItems(session.restaurantId);

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
              <MenuItemRow
                key={item.id}
                item={{
                  id: item.id,
                  name: item.name,
                  pricePaise: item.pricePaise,
                  active: item.active,
                }}
              />
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
