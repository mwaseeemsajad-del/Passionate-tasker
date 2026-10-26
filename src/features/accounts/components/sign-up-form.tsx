"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { MailCheck } from "lucide-react";
import { Button, ErrorSummary, TextField } from "@/components/ui";
import type { Role } from "@/types/accounts";
import { signUp } from "../actions";
import { MIN_PASSWORD, validateSignUp, type FormError, type SignUpInput } from "../validate";

/*
 * Create an account. The same form for customers and tradespeople; `role`
 * decides which kind of account it makes. After sending, the person is told
 * to open the link in their email, in words a screen reader announces.
 */
export function SignUpForm({ role }: { role: Role }) {
  const [input, setInput] = useState<SignUpInput>({ fullName: "", phone: "", email: "", password: "" });
  const [errors, setErrors] = useState<FormError[]>([]);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [sending, startSending] = useTransition();
  const summaryRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  const set = (field: keyof SignUpInput) => (e: React.ChangeEvent<HTMLInputElement>) => setInput((p) => ({ ...p, [field]: e.target.value }));
  const errorFor = (id: string) => errors.find((e) => e.id === id)?.message;

  useEffect(() => {
    if (errors.length > 0) summaryRef.current?.focus();
  }, [errors]);
  useEffect(() => {
    if (sentTo) doneRef.current?.focus();
  }, [sentTo]);

  const send = (event: React.FormEvent) => {
    event.preventDefault();
    const found = validateSignUp(input);
    setErrors(found);
    if (found.length > 0) return;
    startSending(async () => {
      const result = await signUp(role, input);
      if (result.ok) setSentTo(result.checkEmail);
      else setErrors(result.errors);
    });
  };

  if (sentTo) {
    return (
      <div ref={doneRef} tabIndex={-1} className="grid gap-3 rounded-lg border-2 border-ink bg-accent-50 p-6 outline-none">
        <MailCheck aria-hidden="true" className="size-7" strokeWidth={1.5} />
        <h2 className="text-h3">Check your email</h2>
        <p className="text-text-2">
          We have sent a link to <b>{sentTo}</b>. Open it to confirm your email address
          {role === "provider" ? ", then we will take you to the next step: telling us about your trade." : " and finish creating your account."}
        </p>
        <p className="text-text-3">Nothing there after a few minutes? Look in your junk or spam folder.</p>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={send} className="grid gap-6">
      <ErrorSummary ref={summaryRef} errors={errors} />
      <TextField id="fullName" label="Your full name" autoComplete="name" value={input.fullName} onChange={set("fullName")} error={errorFor("fullName")} />
      <TextField
        id="phone"
        label="Phone number"
        hint={role === "provider" ? "We call you on this number to arrange your checks and offer you jobs." : "We call you on this number to confirm each booking."}
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        value={input.phone}
        onChange={set("phone")}
        error={errorFor("phone")}
      />
      <TextField id="email" label="Email address" type="email" autoComplete="email" value={input.email} onChange={set("email")} error={errorFor("email")} />
      <TextField
        id="password"
        label="Choose a password"
        hint={`At least ${MIN_PASSWORD} characters.`}
        type="password"
        autoComplete="new-password"
        value={input.password}
        onChange={set("password")}
        error={errorFor("password")}
      />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <Button type="submit" disabled={sending}>
          {sending ? "Creating your account…" : role === "provider" ? "Create tradesperson account" : "Create account"}
        </Button>
        <p className="text-text-2">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-ink underline underline-offset-4">
            Log in
          </Link>
        </p>
      </div>
    </form>
  );
}
