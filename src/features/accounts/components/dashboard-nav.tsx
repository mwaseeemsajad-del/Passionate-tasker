"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeCheck, Briefcase, CalendarDays, CircleHelp, Inbox, LayoutDashboard, LogOut, Plus, UserRound, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { logOut } from "../actions";

/*
 * The dashboard's own navigation: a sidebar on wide screens, a row of pills
 * on phones. The current page is marked with aria-current. Icons are chosen
 * here by name, because components cannot be passed from the server.
 */

const ICONS = {
  overview: LayoutDashboard,
  jobs: Briefcase,
  checks: BadgeCheck,
  profile: UserRound,
  bookings: CalendarDays,
  book: Plus,
  requests: Inbox,
  people: Users,
};

export type DashboardNavItem = { label: string; href: string; icon: keyof typeof ICONS };

const item = "flex min-h-11 items-center gap-3 rounded-full px-4 font-medium transition-colors lg:rounded-md";
const idle = "border border-line bg-white hover:border-ink lg:border-transparent lg:bg-transparent lg:hover:bg-accent-50";

export function DashboardNav({ items, label }: { items: DashboardNavItem[]; label: string }) {
  const path = usePathname();
  // The first item is the dashboard home, so it only matches exactly.
  const isCurrent = (href: string) => path === href || (href !== items[0]?.href && path.startsWith(`${href}/`));

  return (
    <nav aria-label={label} className="lg:sticky lg:top-6">
      <ul className="flex flex-wrap gap-2 lg:grid lg:gap-1">
        {items.map((link) => {
          const Icon = ICONS[link.icon];
          const active = isCurrent(link.href);
          return (
            <li key={link.href}>
              <Link href={link.href} aria-current={active ? "page" : undefined} className={cn(item, active ? "bg-ink text-white" : idle)}>
                <Icon aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.5} />
                {link.label}
              </Link>
            </li>
          );
        })}
        <li className="lg:mt-4 lg:border-t lg:border-line lg:pt-4">
          <Link href="/help" className={cn(item, idle)}>
            <CircleHelp aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.5} />
            Help
          </Link>
        </li>
        <li>
          <form action={logOut}>
            <button type="submit" className={cn(item, idle, "w-full cursor-pointer")}>
              <LogOut aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.5} />
              Log out
            </button>
          </form>
        </li>
      </ul>
    </nav>
  );
}
