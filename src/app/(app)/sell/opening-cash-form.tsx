"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPaise } from "@/lib/money";
import { openingCashSchema } from "@/lib/opening-cash";
import { saveOpeningCash, type OpeningCashState } from "./opening-cash-actions";

const initial: OpeningCashState = {};

export function OpeningCashForm() {
  const [state, action, pending] = useActionState(saveOpeningCash, initial);
  const [amount, setAmount] = useState("");
  const [paise, setPaise] = useState<number | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  function review() {
    const parsed = openingCashSchema.safeParse({ amount });
    if (!parsed.success) {
      setClientError(parsed.error.issues[0].message);
      return;
    }
    setClientError(null);
    setPaise(parsed.data.amount);
  }

  if (paise !== null) {
    return (
      <form action={action} className="space-y-3">
        <input type="hidden" name="amount" value={amount} />
        <p className="font-medium text-ink-900">
          Save {formatPaise(paise)} as today&apos;s opening cash?
        </p>
        <p className="text-ink-600">
          Are you sure? This value cannot be changed later.
        </p>
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={pending} className="h-11">
            {pending ? "Saving" : "Confirm"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => setPaise(null)}
            className="h-11"
          >
            Edit
          </Button>
        </div>
        <p role="status" className="min-h-5 text-sm text-bad">
          {state.error ?? null}
        </p>
      </form>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor="opening-cash" className="block font-medium text-ink-900">
        Opening cash for today
      </label>
      <div className="flex items-center gap-2">
        <Input
          id="opening-cash"
          inputMode="decimal"
          placeholder="0"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="h-11 w-36"
        />
        <Button type="button" onClick={review} className="h-11">
          Review
        </Button>
      </div>
      <p role="status" className="min-h-5 text-sm text-bad">
        {clientError}
      </p>
    </div>
  );
}
