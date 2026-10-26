"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import type { NavLink } from "@/types/content";

/** Below 992px the pill nav becomes a Menu button that opens a stacked list. */
export function MobileMenu({ links, bordered = false }: { links: NavLink[]; bordered?: boolean }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex min-h-11 cursor-pointer items-center gap-2.5 rounded-full bg-white px-[18px] text-base font-medium${bordered ? " border border-line" : ""}`}
      >
        {open ? <X className="size-5" strokeWidth={1.5} aria-hidden="true" /> : <Menu className="size-5" strokeWidth={1.5} aria-hidden="true" />}
        Menu
      </button>
      <nav
        id={panelId}
        aria-label="Main"
        hidden={!open}
        className="absolute inset-x-4 top-full mt-2 grid gap-1 rounded-xl bg-white p-3 shadow-[0_12px_40px_-12px_rgb(15_17_15/0.35)] sm:inset-x-6 md:inset-x-8"
      >
        {links.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-md px-3.5 py-3 hover:bg-accent-50">
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
