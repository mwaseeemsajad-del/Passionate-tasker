"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, ErrorSummary, TextField } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { safeNext } from "../validate";

/*
 * Two-step sign-in with an authenticator app (TOTP), through Supabase Auth MFA.
 * Setup: scan the QR code (or type the key), then type a code to prove it works.
 * Sign-in: type the code from the app.
 */

type FormError = { id: string; message: string };
const isCode = (v: string) => /^\d{6}$/.test(v.replace(/\s/g, ""));
const CODE_ERROR: FormError[] = [{ id: "code", message: "Enter the 6 numbers your app shows, like 123456" }];

function CodeField({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  return (
    <TextField
      id="code"
      label="6-digit code from your app"
      inputMode="numeric"
      autoComplete="one-time-code"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      className="max-w-xs"
    />
  );
}

function useErrors() {
  const [errors, setErrors] = useState<FormError[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (errors.length) ref.current?.focus();
  }, [errors]);
  return { errors, setErrors, ref };
}

/** The sign-in step, asked after the password, email code or Google when two-step is on. */
export function TwoStepChallenge({ next }: { next: string | null }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const { errors, setErrors, ref } = useErrors();
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCode(code)) return setErrors(CODE_ERROR);
    start(async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.mfa.listFactors();
      const factor = data?.totp.find((f) => f.status === "verified");
      if (!factor) return router.replace("/security");
      const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code: code.replace(/\s/g, "") });
      if (error) return setErrors([{ id: "code", message: "That code is not right, or it has changed. Try the newest code in your app." }]);
      router.replace(safeNext(next) ?? "/account");
      router.refresh();
    });
  };

  return (
    <form noValidate onSubmit={submit} className="grid gap-6">
      <ErrorSummary ref={ref} errors={errors} />
      <CodeField value={code} onChange={setCode} error={errors[0]?.message} />
      <Button type="submit" disabled={pending}>
        {pending ? "Checking…" : "Continue"}
      </Button>
    </form>
  );
}

type Enrolment = { factorId: string; qr: string; secret: string };

/** Turn two-step sign-in on, or see that it is on and turn it off when allowed. */
export function TwoStepSetup({ canTurnOff, next }: { canTurnOff: boolean; next: string | null }) {
  const router = useRouter();
  const [on, setOn] = useState<boolean | null>(null);
  const [enrolment, setEnrolment] = useState<Enrolment | null>(null);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const { errors, setErrors, ref } = useErrors();
  const [pending, start] = useTransition();

  useEffect(() => {
    createClient()
      .auth.mfa.listFactors()
      .then(({ data }) => setOn(Boolean(data?.totp.some((f) => f.status === "verified"))));
  }, []);

  const begin = () =>
    start(async () => {
      setErrors([]);
      const supabase = createClient();
      // A setup left half-way blocks a new one: clear unfinished ones first.
      const { data: list } = await supabase.auth.mfa.listFactors();
      for (const f of list?.all.filter((x) => x.status === "unverified") ?? []) await supabase.auth.mfa.unenroll({ factorId: f.id });
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Authenticator ${Date.now()}` });
      if (error || !data) return setErrors([{ id: "two-step-title", message: "We could not start this just now. Please try again in a minute." }]);
      setEnrolment({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    });

  const confirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrolment) return;
    if (!isCode(code)) return setErrors(CODE_ERROR);
    start(async () => {
      const { error } = await createClient().auth.mfa.challengeAndVerify({ factorId: enrolment.factorId, code: code.replace(/\s/g, "") });
      if (error) return setErrors([{ id: "code", message: "That code is not right. Check the app shows Passionate Taskers, and try the newest code." }]);
      setEnrolment(null);
      setOn(true);
      setErrors([]);
      const back = safeNext(next);
      if (back) return router.replace(back);
      setStatus("Two-step sign-in is on. We will ask for a code each time you sign in.");
      router.refresh();
    });
  };

  const turnOff = () =>
    start(async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.mfa.listFactors();
      for (const f of data?.all ?? []) {
        const { error } = await supabase.auth.mfa.unenroll({ factorId: f.id });
        if (error) return setErrors([{ id: "two-step-title", message: "Sign out, sign in again with your code, then turn this off." }]);
      }
      setOn(false);
      setStatus("Two-step sign-in is off.");
      router.refresh();
    });

  if (on === null) return <p className="text-text-3">Loading…</p>;

  return (
    <div className="grid gap-6">
      <p role="status" className="font-semibold text-accent-strong">
        {status}
      </p>
      <ErrorSummary ref={ref} errors={errors} />

      {on && !enrolment && (
        <div className="grid justify-items-start gap-4">
          <p className="text-text-2">Two-step sign-in is on for your account.</p>
          {canTurnOff && (
            <Button type="button" variant="secondary" onClick={turnOff} disabled={pending}>
              Turn off two-step sign-in
            </Button>
          )}
        </div>
      )}

      {!on && !enrolment && (
        <div className="grid justify-items-start gap-4">
          <p className="text-text-2">
            You need an authenticator app on your phone, such as Google Authenticator, Microsoft Authenticator or 1Password. Each time you sign in, you
            type the 6-digit code it shows, so nobody can get in with your password or email alone.
          </p>
          <Button type="button" onClick={begin} disabled={pending}>
            {pending ? "Starting…" : "Turn on two-step sign-in"}
          </Button>
        </div>
      )}

      {enrolment && (
        <form noValidate onSubmit={confirm} className="grid gap-6">
          <ol className="grid list-decimal gap-4 pl-5 text-text-2">
            <li>
              In your authenticator app, add an account and scan this code:
              {/* eslint-disable-next-line @next/next/no-img-element -- an SVG data URI from Supabase, not a remote image */}
              <img src={enrolment.qr} alt="QR code that adds Passionate Taskers to your authenticator app" width={200} height={200} className="mt-3 rounded-md bg-white p-2" />
            </li>
            <li>
              Cannot scan it? Choose to type a key instead, and enter: <code className="rounded bg-accent-50 px-2 py-1 font-mono break-all text-ink">{enrolment.secret}</code>
            </li>
            <li>Type the 6-digit code the app now shows.</li>
          </ol>
          <CodeField value={code} onChange={setCode} error={errors.find((x) => x.id === "code")?.message} />
          <Button type="submit" disabled={pending}>
            {pending ? "Checking…" : "Turn on"}
          </Button>
        </form>
      )}
    </div>
  );
}
