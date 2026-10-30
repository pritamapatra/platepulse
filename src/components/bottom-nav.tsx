"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActiveTab, tabsFor } from "@/lib/nav";
import type { Role } from "@/lib/session";

export function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-ink-300 bg-surface pb-[env(safe-area-inset-bottom)] md:inset-y-0 md:right-auto md:top-14 md:w-48 md:border-r md:border-t-0"
    >
      <ul className="flex md:flex-col">
        {tabsFor(role).map((tab) => {
          const active = isActiveTab(pathname, tab.href);
          return (
            <li key={tab.href} className="flex-1 md:flex-none">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={
                  "flex h-14 items-center justify-center border-t-2 text-sm md:justify-start md:border-l-2 md:border-t-0 md:px-4 " +
                  (active
                    ? "border-brand font-semibold text-brand"
                    : "border-transparent text-ink-600")
                }
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
