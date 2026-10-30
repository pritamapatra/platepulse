import type { Metadata } from "next";
import { SignUpForm } from "./signup-form";

export const metadata: Metadata = { title: "Sign up" };

export default function SignUpPage() {
  return (
    <main className="mx-auto w-full max-w-[720px] space-y-6 p-4 md:p-6">
      <h1 className="text-xl font-semibold text-ink-900">
        Create your account
      </h1>
      <SignUpForm />
    </main>
  );
}
