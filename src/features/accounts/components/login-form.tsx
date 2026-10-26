"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button, ErrorSummary, TextField } from "@/components/ui";
import { logIn } from "../actions";
import { validateLogin, type FormError, type LoginInput } from "../validate";

/** One login for everyone: customers land on their account, tradespeople on their dashboard. */
export function LoginForm() {
  const params = useSearchParams();
  const [input, setInput] = useState<LoginInput>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormError[]>(() =>
    params.get("error") === "link" ? [{ id: "email", message: "That link has run out or was already used. Log in, or sign up again." }] : [],
  );
  const [sending, startSending] = useTransition();
  const summaryRef = useRef<HTMLDivElement>(null);

  const set = (field: keyof LoginInput) => (e: React.ChangeEvent<HTMLInputElement>) => setInput((p) => ({ ...p, [field]: e.target.value }));
  const errorFor = (id: string) => errors.find((e) => e.id === id)?.message;

  useEffect(() => {
    if (errors.length > 0) summaryRef.current?.focus();
  }, [errors]);

  const send = (event: React.FormEvent) => {
    event.preventDefault();
    const found = validateLogin(input);
    setErrors(found);
    if (found.length > 0) return;
    startSending(async () => {
      // Redirects on success; only comes back with errors.
      const result = await logIn(input, params.get("next"));
      if (result && !result.ok) setErrors(result.errors);
    });
  };

  return (
    <form noValidate onSubmit={send} className="grid gap-6">
      <ErrorSummary ref={summaryRef} errors={errors} />
      <TextField id="email" label="Email address" type="email" autoComplete="email" value={input.email} onChange={set("email")} error={errorFor("email")} />
      <TextField
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        value={input.password}
        onChange={set("password")}
        error={errorFor("password")}
      />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <Button type="submit" disabled={sending}>
          {sending ? "Logging in…" : "Log in"}
        </Button>
        <Link href="/forgot-password" className="font-semibold text-ink underline underline-offset-4">
          Forgotten your password?
        </Link>
      </div>
      <div className="grid gap-2 text-text-2">
        <p>
          New here?{" "}
          <Link href="/signup" className="font-semibold text-ink underline underline-offset-4">
            Create an account
          </Link>
        </p>
        <p>
          A tradesperson?{" "}
          <Link href="/signup/provider" className="font-semibold text-ink underline underline-offset-4">
            Join as a tradesperson
          </Link>
        </p>
      </div>
    </form>
  );
}
