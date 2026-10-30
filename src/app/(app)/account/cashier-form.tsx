"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addCashier, type CashierState } from "./cashier-actions";

const initial: CashierState = {};

export function CashierForm() {
  const [state, action, pending] = useActionState(addCashier, initial);

  return (
    <form action={action} className="space-y-3">
      <h2 className="text-lg font-semibold text-ink-900">Add cashier</h2>
      <label className="block space-y-1 text-sm text-ink-600">
        Cashier email
        <Input
          name="email"
          type="email"
          autoComplete="off"
          required
          className="h-[52px]"
        />
      </label>
      <label className="block space-y-1 text-sm text-ink-600">
        Password (at least 8 characters)
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="h-[52px]"
        />
      </label>
      {state.error ? (
        <p role="alert" className="text-sm text-bad">
          {state.error}
        </p>
      ) : null}
      {state.created ? (
        <p role="status" className="text-sm text-ok">
          Cashier created: {state.created}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="h-[52px] w-full">
        {pending ? "Creating" : "Create cashier"}
      </Button>
    </form>
  );
}
