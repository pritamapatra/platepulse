import type { Role } from "@/lib/session";

export type Tab = { href: string; label: string };

const CASHIER_TABS: readonly Tab[] = [
  { href: "/sell", label: "Sell" },
  { href: "/add", label: "Add" },
  { href: "/close", label: "Close" },
];

const OWNER_TABS: readonly Tab[] = [
  { href: "/today", label: "Today" },
  { href: "/review", label: "Review" },
  { href: "/suppliers", label: "Suppliers" },
  { href: "/reports", label: "Reports" },
];

export function tabsFor(role: Role): readonly Tab[] {
  return role === "cashier" ? CASHIER_TABS : OWNER_TABS;
}

export function isActiveTab(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
