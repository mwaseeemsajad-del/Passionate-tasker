"use client";

import { useState, useTransition } from "react";
import { announce } from "@/lib/announce";
import { useConfirm } from "@/lib/use-confirm";
import { cancelBooking } from "../actions";

/** Cancel a request, after a second press to confirm, so it is never cancelled by accident. */
export function CancelBookingButton({ bookingId, label }: { bookingId: string; label: string }) {
  const { confirming, ask, back, askRef, yesRef, questionId } = useConfirm();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");

  const cls = "inline-flex min-h-11 cursor-pointer items-center rounded-full border px-5 font-medium transition-colors disabled:opacity-50";
  return (
    <div className="grid gap-2">
      {confirming ? (
        <div role="group" aria-labelledby={questionId} className="flex flex-wrap items-center gap-3">
          <span id={questionId} className="font-semibold">
            Cancel this request?
          </span>
          <button
            ref={yesRef}
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await cancelBooking(bookingId);
                if (!r.ok) setMessage(r.message ?? "Please call us.");
                // The booking shows as cancelled and this button goes with it.
                else announce(`Request cancelled: ${label}`, { focusMain: true });
              })
            }
            className={`${cls} border-danger bg-white text-danger`}
          >
            Yes, cancel it<span className="sr-only">: {label}</span>
          </button>
          <button type="button" onClick={back} className={`${cls} border-line bg-white hover:border-ink`}>
            No, keep it
          </button>
        </div>
      ) : (
        <button ref={askRef} type="button" onClick={ask} className={`${cls} w-fit border-line bg-white hover:border-ink`}>
          Cancel request<span className="sr-only">: {label}</span>
        </button>
      )}
      <p role="status" className="text-[0.9375rem] font-semibold text-danger">
        {message}
      </p>
    </div>
  );
}
