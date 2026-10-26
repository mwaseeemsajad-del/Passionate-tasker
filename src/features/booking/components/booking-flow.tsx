"use client";

import { ArrowLeft, CircleCheck, TriangleAlert } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Button, ChoiceGroup, ErrorSummary, TextAreaField, TextField } from "@/components/ui";
import { formatFromPrice, getService, jobsFor, services } from "@/data/services";
import { canUseVoice } from "@/lib/speech";
import type { Trade } from "@/types/content";
import { submitBookingRequest } from "../actions";
import {
  DAYS_AHEAD,
  EMPTY_DRAFT,
  SLOTS,
  STEPS,
  clearDraft,
  describe,
  formatPostcode,
  loadDraft,
  saveDraft,
  upcomingDays,
  validateStep,
  type Draft,
  type FieldError,
} from "../draft";
import { useVoiceGuide } from "../voice-guide";
import { BookingSummary } from "./booking-summary";
import { VoicePanel } from "./voice-panel";

/** Start from the saved draft, or from ?trade=…&job=… when coming from a "Book" button. */
function initialDraft(params: URLSearchParams): Draft {
  const saved = loadDraft();
  const trade = params.get("trade");
  if (!trade || !getService(trade) || saved.trade === trade) return saved;
  const job = params.get("job");
  return { ...EMPTY_DRAFT, trade: trade as Trade, job: jobsFor(trade as Trade).some((j) => j.slug === job) ? (job ?? "") : "" };
}

export function BookingFlow() {
  const params = useSearchParams();
  const [days] = useState(() => upcomingDays(DAYS_AHEAD));
  const [draft, setDraft] = useState<Draft>(() => initialDraft(params));
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [reference, setReference] = useState<string | null>(null);
  const [sending, startSending] = useTransition();
  // This component only renders in the browser (useSearchParams under Suspense), so speech support can be read directly.
  const [voiceSupported] = useState(canUseVoice);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLButtonElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef(draft);
  const focusTarget = useRef<"heading" | "errors" | "done" | null>(null);

  useEffect(() => {
    draftRef.current = draft;
    saveDraft(draft);
  }, [draft]);

  // Coming from "Book by voice": put the start button under the keyboard and screen reader.
  const wantsVoice = params.get("voice") === "1";
  useEffect(() => {
    if (wantsVoice) startRef.current?.focus();
  }, [wantsVoice]);

  // Move focus after the screen changes: to the new step, the errors, or the confirmation.
  useEffect(() => {
    const target = focusTarget.current;
    focusTarget.current = null;
    if (target === "heading") headingRef.current?.focus();
    if (target === "errors") summaryRef.current?.focus();
    if (target === "done") doneRef.current?.focus();
  });

  const set = useCallback(<K extends keyof Draft>(field: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [field]: value, ...(field === "trade" && value !== d.trade ? { job: "" } : {}) }));
    setErrors((prev) => prev.filter((e) => !e.id.startsWith(String(field))));
  }, []);

  const goTo = useCallback((step: number) => {
    setErrors([]);
    focusTarget.current = "heading";
    setDraft((d) => ({ ...d, step }));
  }, []);

  const send = useCallback((d: Draft) => {
    startSending(async () => {
      const result = await submitBookingRequest(d);
      if (result.ok) {
        clearDraft();
        focusTarget.current = "done";
        setReference(result.reference);
      } else {
        focusTarget.current = "errors";
        setErrors(result.errors);
      }
    });
  }, []);

  const next = useCallback(() => {
    const d = draftRef.current;
    const problems = validateStep(d.step, d, days);
    if (problems.length > 0) {
      focusTarget.current = "errors";
      setErrors(problems);
      return;
    }
    if (d.step < STEPS.length - 1) goTo(d.step + 1);
    else send(d);
  }, [days, goTo, send]);

  const voice = useVoiceGuide({ draft, days, reference, set, goTo, next });

  const startOver = () => {
    voice.stop();
    clearDraft();
    setReference(null);
    focusTarget.current = "heading";
    setDraft(EMPTY_DRAFT);
  };

  const errorFor = (id: string) => errors.find((e) => e.id === id)?.message;
  const { service } = describe(draft, days);

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid gap-8">
        <VoicePanel
          status={voice.status}
          said={voice.said}
          heard={voice.heard}
          supported={voiceSupported}
          onStart={voice.start}
          onStop={voice.stop}
          onType={voice.answerByText}
          onSkip={voice.skipToAnswer}
          startRef={startRef}
        />

        {reference ? (
          <div ref={doneRef} tabIndex={-1} className="grid justify-items-start gap-4 rounded-xl border border-line bg-accent-50 p-6 outline-none sm:p-8">
            <CircleCheck aria-hidden="true" className="size-10 text-accent-strong" strokeWidth={1.5} />
            <h2 className="text-h2">Request sent</h2>
            <p className="text-text-2">
              Your reference is <b className="tracking-wide">{reference}</b>. We will call you to confirm who is coming and the final
              price.
            </p>
            <p className="rounded-md bg-white px-4 py-3 text-[0.9375rem] text-text-3">
              This is a demo. Nothing is stored yet and nobody will call.
            </p>
            <Button onClick={startOver}>Book another job</Button>
          </div>
        ) : (
          <form
            noValidate
            aria-labelledby="step-title"
            onSubmit={(e) => {
              e.preventDefault();
              next();
            }}
            className="grid gap-8 rounded-xl border border-line p-6 sm:p-8"
          >
            <StepList current={draft.step} />
            <ErrorSummary ref={summaryRef} errors={errors} />

            <h2 id="step-title" ref={headingRef} tabIndex={-1} className="text-h3 outline-none">
              <span className="block text-base font-normal text-text-3">
                Step {draft.step + 1} of {STEPS.length}
              </span>
              {STEPS[draft.step]}
            </h2>

            {draft.step === 0 && (
              <>
                <ChoiceGroup
                  name="trade"
                  legend="Who do you need?"
                  choices={services.map((s) => ({ value: s.slug, label: s.name, detail: `From £${s.fromPrice}${s.priceUnit === "hour" ? " an hour" : ""}` }))}
                  value={draft.trade}
                  onChange={(v) => set("trade", v as Trade)}
                  error={errorFor("trade-group")}
                />
                {service?.notice && (
                  <p role="note" className="flex gap-3 rounded-lg border-2 border-danger bg-white p-4 font-semibold text-ink">
                    <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-danger" strokeWidth={2} />
                    {service.notice}
                  </p>
                )}
                {service && (
                  <ChoiceGroup
                    name="job"
                    legend={`What does ${service.person} need to do?`}
                    choices={jobsFor(service.slug).map((j) => ({ value: j.slug, label: j.name, detail: formatFromPrice(j) }))}
                    value={draft.job}
                    onChange={(v) => set("job", v)}
                    error={errorFor("job-group")}
                  />
                )}
                <TextField
                  id="postcode"
                  label="Postcode where the job is"
                  hint="For example SW2 1AA. The first part, like SW2, is enough if you are not sure."
                  autoComplete="postal-code"
                  autoCapitalize="characters"
                  className="max-w-[260px]"
                  value={draft.postcode}
                  onChange={(e) => set("postcode", e.target.value)}
                  onBlur={(e) => e.target.value && set("postcode", formatPostcode(e.target.value))}
                  error={errorFor("postcode")}
                />
                <TextAreaField
                  id="details"
                  label={draft.job === "something-else" ? "What needs doing?" : "Anything the tradesperson should know?"}
                  hint="For example parking, pets, stairs, or a description of the problem"
                  optional={draft.job !== "something-else"}
                  value={draft.details}
                  onChange={(e) => set("details", e.target.value)}
                  error={errorFor("details")}
                />
              </>
            )}

            {draft.step === 1 && (
              <>
                <ChoiceGroup
                  name="date"
                  legend="Which day?"
                  columns={3}
                  choices={days.map((d) => ({ value: d.iso, label: d.label, detail: d.long.replace(/^(Today|Tomorrow), /, "") }))}
                  value={draft.date}
                  onChange={(v) => set("date", v)}
                  error={errorFor("date-group")}
                />
                <ChoiceGroup
                  name="slot"
                  legend="What time of day?"
                  columns={3}
                  choices={SLOTS.map((s) => ({ value: s.id, label: s.label, detail: s.hours }))}
                  value={draft.slot}
                  onChange={(v) => set("slot", v as Draft["slot"])}
                  error={errorFor("slot-group")}
                />
              </>
            )}

            {draft.step === 2 && (
              <>
                <TextField id="name" label="Your name" autoComplete="name" value={draft.name} onChange={(e) => set("name", e.target.value)} error={errorFor("name")} />
                <TextField
                  id="phone"
                  label="Phone number"
                  hint="The tradesperson will call this number before they come"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  className="max-w-[320px]"
                  value={draft.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  error={errorFor("phone")}
                />
                <TextField
                  id="email"
                  label="Email address"
                  hint="For a written confirmation"
                  optional
                  type="email"
                  autoComplete="email"
                  value={draft.email}
                  onChange={(e) => set("email", e.target.value)}
                  error={errorFor("email")}
                />
              </>
            )}

            {draft.step === 3 && <Review draft={draft} days={days} onChange={goTo} />}

            <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6">
              <Button type="submit" disabled={sending}>
                {draft.step < STEPS.length - 1 ? "Continue" : sending ? "Sending…" : "Send booking request"}
              </Button>
              {draft.step > 0 && (
                <button
                  type="button"
                  onClick={() => goTo(draft.step - 1)}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4 font-medium underline-offset-4 hover:underline"
                >
                  <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.75} />
                  Back
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <BookingSummary draft={draft} days={days} />
    </div>
  );
}

function StepList({ current }: { current: number }) {
  return (
    <ol className="flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem]" aria-label="Booking steps">
      {STEPS.map((label, i) => (
        <li key={label} aria-current={i === current ? "step" : undefined} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={
              i < current
                ? "grid size-7 place-items-center rounded-full bg-accent-100 text-sm font-semibold"
                : i === current
                  ? "grid size-7 place-items-center rounded-full bg-ink text-sm font-semibold text-white"
                  : "grid size-7 place-items-center rounded-full border border-line text-sm text-text-3"
            }
          >
            {i + 1}
          </span>
          <span className={i === current ? "font-semibold" : "text-text-3"}>
            {label}
            {i < current && <span className="sr-only"> (done)</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}

function Review({ draft, days, onChange }: { draft: Draft; days: ReturnType<typeof upcomingDays>; onChange: (step: number) => void }) {
  const { service, job, day, slot } = describe(draft, days);
  const rows: { label: string; value: string; step: number }[] = [
    { label: "Tradesperson", value: service?.name ?? "", step: 0 },
    { label: "Job", value: job?.name ?? "", step: 0 },
    { label: "Postcode", value: draft.postcode, step: 0 },
    { label: "Notes", value: draft.details.trim() || "None", step: 0 },
    { label: "When", value: day && slot ? `${day.long}, ${slot.label.toLowerCase()} (${slot.hours})` : "", step: 1 },
    { label: "Name", value: draft.name, step: 2 },
    { label: "Phone", value: draft.phone, step: 2 },
    { label: "Email", value: draft.email.trim() || "Not given", step: 2 },
  ];
  return (
    <dl className="grid divide-y divide-line rounded-lg border border-line">
      {rows.map((row) => (
        <div key={row.label} className="grid gap-1 px-5 py-4 sm:grid-cols-[150px_1fr_auto] sm:items-baseline sm:gap-4">
          <dt className="text-[0.9375rem] text-text-3">{row.label}</dt>
          <dd className="font-medium break-words">{row.value}</dd>
          <dd>
            <button type="button" onClick={() => onChange(row.step)} className="cursor-pointer font-semibold underline underline-offset-4">
              Change<span className="sr-only"> {row.label.toLowerCase()}</span>
            </button>
          </dd>
        </div>
      ))}
    </dl>
  );
}
