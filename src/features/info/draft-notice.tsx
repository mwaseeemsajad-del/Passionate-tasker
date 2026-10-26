import { TriangleAlert } from "lucide-react";

/** Shown on legal pages until the client has reviewed them, so nobody mistakes a draft for the final terms. */
export function DraftNotice() {
  return (
    <p role="note" className="flex gap-3 rounded-lg border-2 border-ink bg-accent-50 p-5 font-semibold">
      <TriangleAlert aria-hidden="true" className="mt-0.5 size-6 shrink-0" strokeWidth={2} />
      Draft for review. This page has not yet been checked by a lawyer, and the company details are still to be confirmed.
    </p>
  );
}
