"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp, type SignUpState } from "./actions";

const initial: SignUpState = {};

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, initial);

  if (state.sent) {
    return (
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-ink-900">Check your email</h2>
        <p className="text-ink-600">
          We sent a confirmation link to {state.email}. Open it to finish
          signing up.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <label
          htmlFor="restaurantName"
          className="text-sm font-medium text-ink-900"
        >
          Restaurant name
        </label>
        <Input
          id="restaurantName"
          name="restaurantName"
          className="h-11"
          required
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-ink-900">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="h-11"
          required
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-ink-900">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          className="h-11"
          required
        />
        <p className="text-[13px] text-ink-600">At least 8 characters</p>
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-bad">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="h-[52px] w-full">
        {pending ? "Creating account" : "Create account"}
      </Button>
    </form>
  );
}
