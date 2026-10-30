import Link from "next/link";
import { formatPaise } from "@/lib/money";

type Tile = {
  id: string;
  name: string;
  pricePaise: number;
};

export function SellGrid({
  items,
  isOwner,
}: {
  items: Tile[];
  isOwner: boolean;
}) {
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
      <ul className="grid grid-cols-2 gap-2.5">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex h-24 select-none flex-col justify-between rounded-lg bg-surface-subtle p-3"
          >
            <span className="line-clamp-2 break-words text-lg font-semibold leading-snug text-ink-900">
              {item.name}
            </span>
            <span className="text-xl font-semibold tabular-nums tracking-tight text-ink-900">
              {formatPaise(item.pricePaise)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
