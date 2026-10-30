"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  addToCart,
  cartItemCount,
  cartTotalPaise,
  pruneCart,
  removeFromCart,
  type Cart,
} from "@/lib/cart";
import { formatPaise } from "@/lib/money";

type Tile = {
  id: string;
  name: string;
  pricePaise: number;
};

export function SellGrid({
  items,
  isOwner,
}: {
  items: Tile[];
  isOwner: boolean;
}) {
  const [cart, setCart] = useState<Cart>({});

  const validIds = useMemo(() => new Set(items.map((i) => i.id)), [items]);
  const prices = useMemo(
    () => Object.fromEntries(items.map((i) => [i.id, i.pricePaise])),
    [items],
  );
  const effective = useMemo(() => pruneCart(cart, validIds), [cart, validIds]);

  const removedLines = Object.keys(cart).length - Object.keys(effective).length;
  const count = cartItemCount(effective);
  const total = cartTotalPaise(effective, prices);

  function add(id: string) {
    setCart((current) => addToCart(pruneCart(current, validIds), id));
  }

  function remove(id: string) {
    setCart((current) => removeFromCart(pruneCart(current, validIds), id));
  }

  if (items.length === 0) {
    return (
      <p className="text-ink-600">
        No items to sell yet.{" "}
        {isOwner ? (
          <Link href="/menu" className="font-medium text-brand underline">
            Add items in Menu
          </Link>
        ) : (
          "Ask the owner to add menu items."
        )}
      </p>
    );
  }

  return (
    <section aria-label="Menu items" className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-600">
        Items
      </h2>
      {removedLines > 0 ? (
        <p role="status" className="text-sm text-warn">
          Some items are no longer available and were removed from the cart.
        </p>
      ) : null}
      <ul className="grid grid-cols-2 gap-2.5">
        {items.map((item) => {
          const qty = effective[item.id] ?? 0;
          return (
            <li key={item.id} className="relative h-24 select-none">
              <button
                type="button"
                onClick={() => add(item.id)}
                aria-label={`Add ${item.name}, ${formatPaise(item.pricePaise)}, ${qty} in cart`}
                className={`flex h-full w-full flex-col justify-between rounded-lg bg-surface-subtle p-3 text-left active:bg-ink-300 focus-visible:outline-2 focus-visible:outline-brand ${
                  qty > 0 ? "ring-2 ring-brand" : ""
                }`}
              >
                <span
                  className={`line-clamp-2 break-words text-lg font-semibold leading-snug text-ink-900 ${
                    qty > 0 ? "pr-9" : ""
                  }`}
                >
                  {item.name}
                </span>
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-xl font-semibold tabular-nums tracking-tight text-ink-900">
                    {formatPaise(item.pricePaise)}
                  </span>
                  {qty > 0 ? (
                    <span className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-brand px-1.5 text-xs font-semibold tabular-nums text-white">
                      {qty}
                    </span>
                  ) : null}
                </span>
              </button>
              {qty > 0 ? (
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  aria-label={`Remove one ${item.name}`}
                  className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center focus-visible:outline-2 focus-visible:outline-brand"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-lg font-bold leading-none text-ink-900">
                    -
                  </span>
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
      {count > 0 ? (
        <div
          role="status"
          className="sticky bottom-20 z-10 flex items-center justify-between rounded-lg border border-ink-300 bg-surface p-3 shadow-sm"
        >
          <span className="text-ink-600">
            {count} {count === 1 ? "item" : "items"}
          </span>
          <span className="text-xl font-semibold tabular-nums text-ink-900">
            {formatPaise(total)}
          </span>
        </div>
      ) : null}
    </section>
  );
}
