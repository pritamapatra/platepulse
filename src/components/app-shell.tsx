import { User } from "lucide-react";
import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import type { Role } from "@/lib/session";

export function AppShell({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex h-14 items-center justify-between border-b border-ink-300 bg-surface px-4">
        <span className="text-base font-semibold text-ink-900">PlatePulse</span>
        <Link
          href="/account"
          className="flex h-11 items-center gap-2 text-sm text-ink-600"
        >
          <User className="size-4" aria-hidden="true" />
          Account
        </Link>
      </header>
      <BottomNav role={role} />
      <div className="flex-1 pb-20 md:pb-0 md:pl-48">{children}</div>
    </div>
  );
}
