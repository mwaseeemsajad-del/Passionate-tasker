"use client";

import { useId, useState, useTransition } from "react";
import { checkStatus as checkWords } from "@/features/accounts/booking-status";
import type { CheckStatus, ProviderCheck, ProviderStatus } from "@/types/accounts";
import { approveProvider, offerBooking, setBookingStatus, setCheck, setProviderStatus, type AdminResult } from "../actions";

/*
 * Small interactive pieces of the team dashboard. Each shows its own result
 * in a live region, so a screen reader hears "Saved" or the problem.
 */

const pill = "inline-flex min-h-11 cursor-pointer items-center rounded-full px-5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const field = "min-h-11 rounded-md border border-line bg-white px-3 text-base text-ink";

function useAction() {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const run = (fn: () => Promise<AdminResult>) =>
    start(async () => {
      setMessage(null);
      const r = await fn();
      setMessage(r.ok ? { ok: true, text: "Saved" } : { ok: false, text: r.message });
    });
  const status = (
    <p role="status" className={message?.ok ? "text-[0.9375rem] font-semibold" : "text-[0.9375rem] font-semibold text-danger"}>
      {message?.text}
    </p>
  );
  return { pending, run, status };
}

/** Offer a request to one of the approved tradespeople who do this trade. */
export function OfferControl({ bookingId, label, providers, current }: { bookingId: string; label: string; providers: { id: string; name: string }[]; current: string | null }) {
  const id = useId();
  const [chosen, setChosen] = useState(current ?? "");
  const { pending, run, status } = useAction();
  if (providers.length === 0) return <p className="text-[0.9375rem] text-text-3">No approved tradesperson for this trade yet.</p>;
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-[0.9375rem] font-semibold">
        Offer to<span className="sr-only">, for {label}</span>
      </label>
      <div className="flex flex-wrap gap-2">
        <select id={id} value={chosen} onChange={(e) => setChosen(e.target.value)} className={`${field} min-w-0 flex-1 basis-48`}>
          <option value="">Choose a tradesperson</option>
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button type="button" disabled={pending} onClick={() => run(() => offerBooking(bookingId, chosen))} className={`${pill} bg-ink text-white`}>
          Offer job<span className="sr-only">: {label}</span>
        </button>
      </div>
      {status}
    </div>
  );
}

/** Close, cancel or reopen a request. */
export function BookingStatusControls({ bookingId, label, status: current }: { bookingId: string; label: string; status: string }) {
  const { pending, run, status } = useAction();
  const open = current === "new" || current === "offered" || current === "declined" || current === "accepted";
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        {current === "accepted" && (
          <button type="button" disabled={pending} onClick={() => run(() => setBookingStatus(bookingId, "completed"))} className={`${pill} border border-line bg-white hover:border-ink`}>
            Mark as done<span className="sr-only">: {label}</span>
          </button>
        )}
        {open && (
          <button type="button" disabled={pending} onClick={() => run(() => setBookingStatus(bookingId, "cancelled"))} className={`${pill} border border-danger bg-white text-danger`}>
            Cancel request<span className="sr-only">: {label}</span>
          </button>
        )}
        {(current === "cancelled" || current === "declined") && (
          <button type="button" disabled={pending} onClick={() => run(() => setBookingStatus(bookingId, "new"))} className={`${pill} border border-line bg-white hover:border-ink`}>
            Reopen<span className="sr-only">: {label}</span>
          </button>
        )}
      </div>
      {status}
    </div>
  );
}

/** Approve or reject one check, with a note the tradesperson sees and its expiry date. */
export function CheckControl({ check, title }: { check: ProviderCheck; title: string }) {
  const id = useId();
  const [value, setValue] = useState<CheckStatus>(check.status);
  const [note, setNote] = useState(check.note);
  const [expires, setExpires] = useState(check.expiresOn ?? "");
  const { pending, run, status } = useAction();
  return (
    <fieldset className="grid gap-2 rounded-md border border-line p-4">
      <legend className="px-1 font-semibold">{title}</legend>
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1">
          <label htmlFor={`${id}-s`} className="text-[0.9375rem]">
            Status
          </label>
          <select id={`${id}-s`} value={value} onChange={(e) => setValue(e.target.value as CheckStatus)} className={field}>
            {(Object.keys(checkWords) as CheckStatus[]).map((s) => (
              <option key={s} value={s}>
                {checkWords[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1">
          <label htmlFor={`${id}-e`} className="text-[0.9375rem]">
            Runs out
          </label>
          <input id={`${id}-e`} type="date" value={expires} onChange={(e) => setExpires(e.target.value)} className={field} />
        </div>
        <div className="grid min-w-0 flex-1 basis-48 gap-1">
          <label htmlFor={`${id}-n`} className="text-[0.9375rem]">
            Note for the tradesperson
          </label>
          <input id={`${id}-n`} value={note} onChange={(e) => setNote(e.target.value)} className={field} />
        </div>
        <button type="button" disabled={pending} onClick={() => run(() => setCheck(check.id, value, note, expires))} className={`${pill} bg-ink text-white`}>
          Save<span className="sr-only">: {title}</span>
        </button>
      </div>
      {status}
    </fieldset>
  );
}

/** Approve, hold or pause a tradesperson. */
export function ProviderStatusControl({ providerId, name, status: current }: { providerId: string; name: string; status: ProviderStatus }) {
  const id = useId();
  const [value, setValue] = useState<ProviderStatus>(current);
  const { pending, run, status } = useAction();
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1">
          <label htmlFor={id} className="text-[0.9375rem] font-semibold">
            Account<span className="sr-only"> for {name}</span>
          </label>
          <select id={id} value={value} onChange={(e) => setValue(e.target.value as ProviderStatus)} className={field}>
            <option value="pending_checks">Checks in progress</option>
            <option value="approved">Approved for jobs</option>
            <option value="paused">Paused</option>
          </select>
        </div>
        <button type="button" disabled={pending} onClick={() => run(() => setProviderStatus(providerId, value))} className={`${pill} bg-ink text-white`}>
          Save<span className="sr-only">: {name}</span>
        </button>
      </div>
      {status}
    </div>
  );
}

/** Approve a tradesperson in one step, after a second press to confirm. */
export function ApproveProviderButton({ providerId, name }: { providerId: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const { pending, run, status } = useAction();
  return (
    <div className="grid gap-2">
      {confirming ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold">Mark every check as done and approve {name}?</span>
          <button type="button" disabled={pending} onClick={() => run(() => approveProvider(providerId))} className={`${pill} bg-ink text-white`}>
            Yes, approve
          </button>
          <button type="button" onClick={() => setConfirming(false)} className={`${pill} border border-line bg-white hover:border-ink`}>
            Not yet
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirming(true)} className={`${pill} w-fit bg-ink text-white`}>
          Approve<span className="sr-only"> {name}</span>
        </button>
      )}
      {status}
    </div>
  );
}
