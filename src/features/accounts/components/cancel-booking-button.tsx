"use client";

import { useState, useTransition } from "react";
import { cancelBooking } from "../actions";

/** Cancel a request, after a second press to confirm, so it is never cancelled by accident. */
export function CancelBookingButton({ bookingId, label }: { bookingId: string; label: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");

  const cls = "inline-flex min-h-11 cursor-pointer items-center rounded-full border px-5 font-medium transition-colors disabled:opacity-50";
  return (
    <div className="grid gap-2">
      {confirming ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold">Cancel this request?</span>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await cancelBooking(bookingId);
                if (!r.ok) setMessage(r.message ?? "Please call us.");
              })
            }
            className={`${cls} border-danger bg-white text-danger`}
          >
            Yes, cancel it<span className="sr-only">: {label}</span>
          </button>
          <button type="button" onClick={() => setConfirming(false)} className={`${cls} border-line bg-white hover:border-ink`}>
            No, keep it
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirming(true)} className={`${cls} w-fit border-line bg-white hover:border-ink`}>
          Cancel request<span className="sr-only">: {label}</span>
        </button>
      )}
      <p role="status" className="text-[0.9375rem] font-semibold text-danger">
        {message}
      </p>
    </div>
  );
}
