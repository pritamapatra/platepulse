"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPaise } from "@/lib/money";
import {
  deleteMenuItem,
  setMenuItemActive,
  updateMenuItemPrice,
  type MenuState,
} from "./actions";

type Item = {
  id: string;
  name: string;
  pricePaise: number;
  active: boolean;
};

const initial: MenuState = {};

export function MenuItemRow({ item }: { item: Item }) {
  const [confirming, setConfirming] = useState(false);
  const [priceState, priceAction, pricePending] = useActionState(
    updateMenuItemPrice,
    initial,
  );
  const [activeState, activeAction, activePending] = useActionState(
    setMenuItemActive,
    initial,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteMenuItem,
    initial,
  );
  const error = priceState.error ?? activeState.error ?? deleteState.error;

  return (
    <li className="space-y-2 py-3">
      <div className="flex min-h-11 items-center justify-between gap-4">
        <span className={item.active ? "text-ink-900" : "text-ink-600"}>
          {item.name}
          {item.active ? null : (
            <span className="ml-2 text-sm font-medium text-warn">Hidden</span>
          )}
        </span>
        <span className="tabular-nums text-ink-600">
          {formatPaise(item.pricePaise)}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <form action={priceAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={item.id} />
          <Input
            name="price"
            inputMode="decimal"
            aria-label={`New price for ${item.name}`}
            defaultValue={(item.pricePaise / 100).toFixed(2)}
            className="h-11 w-28"
          />
          <Button
            type="submit"
            variant="outline"
            disabled={pricePending}
            className="h-11"
          >
            {pricePending ? "Saving" : "Save price"}
          </Button>
        </form>
        <form action={activeAction}>
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="active" value={String(!item.active)} />
          <Button
            type="submit"
            variant="outline"
            disabled={activePending}
            className="h-11"
          >
            {item.active ? "Hide" : "Show"}
          </Button>
        </form>
        {confirming ? (
          <form action={deleteAction} className="flex items-center gap-2">
            <input type="hidden" name="id" value={item.id} />
            <span className="text-sm font-medium text-bad">Delete?</span>
            <Button
              type="submit"
              variant="outline"
              disabled={deletePending}
              className="h-11"
            >
              {deletePending ? "Deleting" : "Confirm"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirming(false)}
              className="h-11"
            >
              Cancel
            </Button>
          </form>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setConfirming(true)}
            className="h-11"
          >
            Delete
          </Button>
        )}
      </div>
      <p role="status" className="min-h-5 text-sm">
        {error ? (
          <span className="text-bad">{error}</span>
        ) : priceState.saved ? (
          <span className="text-ok">Price saved</span>
        ) : null}
      </p>
    </li>
  );
}
