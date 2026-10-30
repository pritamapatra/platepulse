"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addMenuItem, type MenuState } from "./actions";

const initial: MenuState = {};

export function MenuForm() {
  const [state, action, pending] = useActionState(addMenuItem, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.added) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <h2 className="text-lg font-semibold text-ink-900">Add item</h2>
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium text-ink-900">
          Item name
        </label>
        <Input
          id="name"
          name="name"
          autoComplete="off"
          maxLength={60}
          required
          className="h-11"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="price" className="text-sm font-medium text-ink-900">
          Price in rupees
        </label>
        <Input
          id="price"
          name="price"
          inputMode="decimal"
          autoComplete="off"
          required
          className="h-11"
        />
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-bad">
          {state.error}
        </p>
      ) : null}
      {state.added ? (
        <p role="status" className="text-sm text-ok">
          Added: {state.added}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="h-[52px] w-full">
        {pending ? "Saving" : "Add item"}
      </Button>
    </form>
  );
}
