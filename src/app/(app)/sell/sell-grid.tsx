"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  addToCart,
  cartItemCount,
  cartTotalPaise,
  pruneCart,
  removeFromCart,
  type Cart,
} from "@/lib/cart";
import { formatPaise } from "@/lib/money";
import {
  PAYMENT_LABELS,
  PAYMENT_METHODS,
  canSaveSale,
  type PaymentMethod,
} from "@/lib/payment";
import { cartSignature, nextAttempt, type Attempt } from "@/lib/sale-attempt";
import { newRequestId } from "@/lib/uuid";
import { saveSale } from "./sale-actions";

type Tile = {
  id: string;
  name: string;
  pricePaise: number;
};

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; totalPaise: number }
  | { kind: "failed"; error: string };

export function SellGrid({
  items,
  isOwner,
}: {
  items: Tile[];
  isOwner: boolean;
}) {
  const [cart, setCart] = useState<Cart>({});
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const attemptRef = useRef<Attempt>(null);
  const lockRef = useRef(false);

  const validIds = useMemo(() => new Set(items.map((i) => i.id)), [items]);
  const prices = useMemo(
    () => Object.fromEntries(items.map((i) => [i.id, i.pricePaise])),
    [items],
  );
  const effective = useMemo(() => pruneCart(cart, validIds), [cart, validIds]);

  const removedLines = Object.keys(cart).length - Object.keys(effective).length;
  const count = cartItemCount(effective);
  const total = cartTotalPaise(effective, prices);
  const activeMethod = count > 0 ? method : null;
  const saving = status.kind === "saving";
  const saveEnabled =
    canSaveSale({ totalPaise: total, method: activeMethod }) && !saving;

  function clearMessage() {
    setStatus((current) =>
      current.kind === "saving" ? current : { kind: "idle" },
    );
  }

  function add(id: string) {
    if (saving) return;
    if (count === 0) setMethod(null);
    clearMessage();
    setCart((current) => addToCart(pruneCart(current, validIds), id));
  }

  function remove(id: string) {
    if (saving) return;
    clearMessage();
    setCart((current) => removeFromCart(pruneCart(current, validIds), id));
  }

  function choose(value: PaymentMethod) {
    if (saving) return;
    clearMessage();
    setMethod(value);
  }

  async function save() {
    if (lockRef.current || activeMethod === null || !saveEnabled) return;
    lockRef.current = true;

    const attempt = nextAttempt(
      attemptRef.current,
      cartSignature(effective, activeMethod),
      newRequestId,
    );
    attemptRef.current = attempt;
    setStatus({ kind: "saving" });

    try {
      const result = await saveSale({
        clientRequestId: attempt.id,
        method: activeMethod,
        lines: Object.entries(effective).map(([menuItemId, quantity]) => ({
          menuItemId,
          quantity,
        })),
      });
      if (result.ok) {
        attemptRef.current = null;
        setCart({});
        setMethod(null);
        setStatus({ kind: "saved", totalPaise: result.totalPaise });
      } else {
        setStatus({ kind: "failed", error: result.error });
      }
    } catch {
      setStatus({
        kind: "failed",
        error: "Cannot save. Check your connection and retry.",
      });
    } finally {
      lockRef.current = false;
    }
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
      {status.kind === "saved" ? (
        <p role="status" className="font-medium text-ok">
          Sale saved: {formatPaise(status.totalPaise)}
        </p>
      ) : null}
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
                disabled={saving}
                onClick={() => add(item.id)}
                aria-label={`Add ${item.name}, ${formatPaise(item.pricePaise)}, ${qty} in cart`}
                className={`flex h-full w-full flex-col justify-between rounded-lg bg-surface-subtle p-3 text-left active:bg-ink-300 focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-60 ${
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
                  disabled={saving}
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
        <div className="sticky bottom-20 z-10 space-y-3 rounded-lg border border-ink-300 bg-surface p-3 shadow-sm">
          <div role="status" className="flex items-center justify-between">
            <span className="text-ink-600">
              {count} {count === 1 ? "item" : "items"}
            </span>
            <span className="text-xl font-semibold tabular-nums text-ink-900">
              {formatPaise(total)}
            </span>
          </div>
          <div
            role="radiogroup"
            aria-label="Payment method"
            className="grid grid-cols-2 gap-2"
          >
            {PAYMENT_METHODS.map((value) => {
              const selected = activeMethod === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={saving}
                  onClick={() => choose(value)}
                  className={`h-11 rounded-lg border text-base font-semibold focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-60 ${
                    selected
                      ? "border-brand bg-brand text-white"
                      : "border-ink-300 bg-surface text-ink-900"
                  }`}
                >
                  {PAYMENT_LABELS[value]}
                </button>
              );
            })}
          </div>
          <p role="status" className="min-h-5 text-sm">
            {status.kind === "failed" ? (
              <span className="text-bad">{status.error}</span>
            ) : activeMethod === null ? (
              <span className="text-ink-600">
                Choose Cash or UPI to continue
              </span>
            ) : null}
          </p>
          <Button
            type="button"
            disabled={!saveEnabled}
            onClick={save}
            className="h-[52px] w-full"
          >
            {saving
              ? "Saving"
              : status.kind === "failed"
                ? "Retry"
                : "Save sale"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
