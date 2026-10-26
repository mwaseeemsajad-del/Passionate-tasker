import Link from "next/link";
import { cn } from "@/lib/cn";

export type ListTab = { id: string; label: string; count: number; href: string };

/*
 * Tabs between the lists on a dashboard page. Plain links, not a tab
 * widget: each list has its own address and works without JavaScript.
 * The list shown is marked with aria-current.
 */
export function ListTabs({ tabs, current, label }: { tabs: ListTab[]; current: string; label: string }) {
  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <li key={t.id}>
            <Link
              href={t.href}
              aria-current={t.id === current ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-medium transition-colors",
                t.id === current ? "bg-ink text-white" : "border border-line bg-white hover:border-ink",
              )}
            >
              {t.label}
              <span className={cn("rounded-full px-2 text-sm font-semibold", t.id === current ? "bg-accent text-ink" : "bg-accent-100")}>{t.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
