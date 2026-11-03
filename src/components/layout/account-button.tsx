"use client";

import Link from "next/link";
import { LayoutDashboard, LogIn, UserPlus } from "lucide-react";
import { useAccountLink } from "@/features/accounts/use-account-link";
import { cn } from "@/lib/cn";

const pill = "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 sm:px-[18px] text-base font-medium whitespace-nowrap transition-colors";

/**
 * The header's account buttons, on every page and screen size: Log in and
 * Register when signed out, or your dashboard once signed in.
 */
export function AccountButton({ bordered = false }: { bordered?: boolean }) {
  const link = useAccountLink();

  if (link.signedIn) {
    return (
      <Link href={link.href} className={cn(pill, "bg-ink text-white hover:bg-ink/90")}>
        <LayoutDashboard aria-hidden="true" className="size-5" strokeWidth={1.5} />
        <span className="sr-only sm:not-sr-only">{link.label}</span>
      </Link>
    );
  }

  const outline = cn(pill, "bg-white text-ink hover:bg-accent-50", bordered && "border border-line");
  return (
    <>
      <Link href={link.href} className={outline}>
        <LogIn aria-hidden="true" className="size-5" strokeWidth={1.5} />
        {/* Icon only on narrow phones, so the header fits at 320px; screen readers always hear the label. */}
        <span className="sr-only sm:not-sr-only">{link.label}</span>
      </Link>
      <Link href="/signup" className={cn(pill, "bg-accent text-on-accent hover:bg-accent-strong")}>
        <UserPlus aria-hidden="true" className="size-5" strokeWidth={1.5} />
        <span className="sr-only sm:not-sr-only">Register</span>
      </Link>
    </>
  );
}
