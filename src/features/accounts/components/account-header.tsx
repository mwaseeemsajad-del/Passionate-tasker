import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui";

/** Top of a dashboard page: eyebrow, the page's h1, and optional badges or a line of detail. */
export function AccountHeader({ eyebrow, title, children, action }: { eyebrow: string; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6">
      <div className="grid gap-3">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="text-h2">{title}</h1>
        {children}
      </div>
      {action}
    </header>
  );
}

/** A titled block inside a dashboard, with an optional link on the right ("See all jobs"). */
export function DashboardSection({ id, title, count, action, children }: { id: string; title: string; count?: number; action?: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id={id} className="text-h3">
          {title}
          {count !== undefined && <span className="text-text-3"> ({count})</span>}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** What a dashboard list says when it has nothing in it. */
export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-dashed border-line bg-white p-6 text-text-3">{children}</p>;
}
