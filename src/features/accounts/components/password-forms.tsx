"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { MailCheck } from "lucide-react";
import { Button, ErrorSummary, TextField } from "@/components/ui";
import { requestPasswordReset, updatePassword } from "../actions";
import { MIN_PASSWORD, type FormError } from "../validate";

function useFocusOnErrors(errors: FormError[]) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (errors.length > 0) ref.current?.focus();
  }, [errors]);
  return ref;
}

/** Ask for a reset link. */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FormError[]>([]);
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();
  const summaryRef = useFocusOnErrors(errors);
  const doneRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (sent) doneRef.current?.focus();
  }, [sent]);

  if (sent) {
    return (
      <div ref={doneRef} tabIndex={-1} className="grid gap-3 rounded-lg border-2 border-ink bg-accent-50 p-6 outline-none">
        <MailCheck aria-hidden="true" className="size-7" strokeWidth={1.5} />
        <h2 className="text-h3">Check your email</h2>
        <p className="text-text-2">If there is an account for {email.trim()}, we have sent it a link to choose a new password.</p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await requestPasswordReset(email);
          if (r.ok) setSent(true);
          else setErrors(r.errors);
        });
      }}
      className="grid gap-6"
    >
      <ErrorSummary ref={summaryRef} errors={errors} />
      <TextField id="email" label="Email address" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.find((x) => x.id === "email")?.message} />
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send reset link"}
        </Button>
      </div>
    </form>
  );
}

/** Choose a new password, after opening the reset link. */
export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormError[]>([]);
  const [pending, start] = useTransition();
  const summaryRef = useFocusOnErrors(errors);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          // Redirects to the account on success.
          const r = await updatePassword(password);
          if (r && !r.ok) setErrors(r.errors);
        });
      }}
      className="grid gap-6"
    >
      <ErrorSummary ref={summaryRef} errors={errors} />
      <TextField
        id="password"
        label="New password"
        hint={`At least ${MIN_PASSWORD} characters.`}
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.find((x) => x.id === "password")?.message}
      />
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save new password"}
        </Button>
      </div>
    </form>
  );
}
