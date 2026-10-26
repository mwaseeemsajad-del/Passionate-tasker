"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui";
import { checks as checkCopy } from "@/data/trust";
import { checkStatus } from "@/features/accounts/booking-status";
import type { ProviderCheck } from "@/types/accounts";
import { markCheckSubmitted } from "../actions";

/** One check on the provider dashboard, with "I have sent this" while it is still to do. */
export function CheckRow({ check }: { check: ProviderCheck }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const title = checkCopy.find((c) => c.id === check.kind)?.title ?? check.kind;
  const canSend = check.status === "not_started" || check.status === "rejected";

  return (
    <li className="grid gap-3 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-h4">{title}</h3>
        <Badge>{checkStatus[check.status]}</Badge>
      </div>
      {check.note && <p className="text-text-2">{check.note}</p>}
      {check.expiresOn && (
        <p className="text-[0.9375rem] text-text-3">
          Runs out {new Date(`${check.expiresOn}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      )}
      {canSend && (
        <div className="grid gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                setError("");
                const r = await markCheckSubmitted(check.id);
                if (!r.ok) setError(r.errors[0]?.message ?? "Please try again.");
              })
            }
            className="inline-flex min-h-11 w-fit cursor-pointer items-center rounded-full border border-line bg-white px-5 font-medium transition-colors hover:border-ink disabled:opacity-50"
          >
            I have sent this to the team<span className="sr-only">: {title}</span>
          </button>
          <p role="status" className="text-[0.9375rem] font-semibold text-danger">
            {error}
          </p>
        </div>
      )}
    </li>
  );
}
