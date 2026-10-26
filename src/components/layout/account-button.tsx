"use client";

import Link from "next/link";
import { LayoutDashboard, LogIn } from "lucide-react";
import { useAccountLink } from "@/features/accounts/use-account-link";
import { cn } from "@/lib/cn";

/** The header's account button, on every page and screen size: Log in, or your dashboard once signed in. */
export function AccountButton({ bordered = false }: { bordered?: boolean }) {
  const link = useAccountLink();
  const Icon = link.signedIn ? LayoutDashboard : LogIn;
  return (
    <Link
      href={link.href}
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 sm:px-[18px] text-base font-medium whitespace-nowrap transition-colors",
        link.signedIn ? "bg-ink text-white hover:bg-ink/90" : "bg-white text-ink hover:bg-accent-50",
        bordered && !link.signedIn && "border border-line",
      )}
    >
      <Icon aria-hidden="true" className="size-5" strokeWidth={1.5} />
      {/* Icon only on narrow phones, so the header fits at 320px; screen readers always hear the label. */}
      <span className="sr-only sm:not-sr-only">{link.label}</span>
    </Link>
  );
}
