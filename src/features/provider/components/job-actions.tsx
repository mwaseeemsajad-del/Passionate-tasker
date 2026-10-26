"use client";

import { useState, useTransition } from "react";
import { completeJob, respondToJob } from "../actions";

const pill = "inline-flex min-h-11 cursor-pointer items-center rounded-full px-5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

/** Accept or decline an offered job, or mark a booked one done. Errors are announced. */
export function JobActions({ bookingId, mode, label }: { bookingId: string; mode: "respond" | "complete"; label: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  const act = (fn: () => Promise<{ ok: boolean; errors?: { message: string }[] }>) =>
    start(async () => {
      setError("");
      const result = await fn();
      if (!result.ok) setError(result.errors?.[0]?.message ?? "Something went wrong. Please try again.");
    });

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-3">
        {mode === "respond" ? (
          <>
            <button type="button" disabled={pending} onClick={() => act(() => respondToJob(bookingId, true))} className={`${pill} bg-ink text-white`}>
              Accept<span className="sr-only">: {label}</span>
            </button>
            <button type="button" disabled={pending} onClick={() => act(() => respondToJob(bookingId, false))} className={`${pill} border border-line bg-white hover:border-ink`}>
              Decline<span className="sr-only">: {label}</span>
            </button>
          </>
        ) : (
          <button type="button" disabled={pending} onClick={() => act(() => completeJob(bookingId))} className={`${pill} bg-ink text-white`}>
            Mark as done<span className="sr-only">: {label}</span>
          </button>
        )}
      </div>
      <p role="status" className="text-[0.9375rem] font-semibold text-danger">
        {error}
      </p>
    </div>
  );
}
