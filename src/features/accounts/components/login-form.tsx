"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button, ErrorSummary, SegmentedToggle, TextField } from "@/components/ui";
import { logIn, sendLoginCode, signInWithGoogle, verifyLoginCode } from "../actions";
import { validateLogin, type FormError, type LoginInput } from "../validate";

type Method = "password" | "code";

/**
 * One login for everyone: customers land on their account, tradespeople on
 * their dashboard. Three ways in: Google, password, or a code sent by email.
 */
export function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next");
  const [method, setMethod] = useState<Method>("password");
  const [input, setInput] = useState<LoginInput>({ email: "", password: "" });
  const [code, setCode] = useState("");
  // The address the code was sent to; set once sent, switches the form to the code step.
  const [codeSentTo, setCodeSentTo] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormError[]>(() =>
    params.get("error") === "link" ? [{ id: "email", message: "That link has run out or was already used. Log in, or sign up again." }] : [],
  );
  const [sending, startSending] = useTransition();
  const summaryRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  const set = (field: keyof LoginInput) => (e: React.ChangeEvent<HTMLInputElement>) => setInput((p) => ({ ...p, [field]: e.target.value }));
  const errorFor = (id: string) => errors.find((e) => e.id === id)?.message;

  useEffect(() => {
    if (errors.length > 0) summaryRef.current?.focus();
  }, [errors]);

  useEffect(() => {
    if (codeSentTo) codeRef.current?.focus();
  }, [codeSentTo]);

  const choose = (m: Method) => {
    setMethod(m);
    setErrors([]);
    setCodeSentTo(null);
    setCode("");
  };

  const google = () =>
    startSending(async () => {
      // Redirects to Google on success; only comes back on failure.
      const result = await signInWithGoogle(next);
      if (result && !result.ok) setErrors([{ id: "email", message: result.message }]);
    });

  const send = (event: React.FormEvent) => {
    event.preventDefault();
    if (method === "password") {
      const found = validateLogin(input);
      setErrors(found);
      if (found.length > 0) return;
      startSending(async () => {
        // Redirects on success; only comes back with errors.
        const result = await logIn(input, next);
        if (result && !result.ok) setErrors(result.errors);
      });
      return;
    }
    if (!codeSentTo) {
      startSending(async () => {
        const result = await sendLoginCode(input.email);
        setErrors(result.errors);
        if (result.ok) setCodeSentTo(input.email.trim());
      });
      return;
    }
    startSending(async () => {
      const result = await verifyLoginCode(codeSentTo, code, next);
      if (result && !result.ok) setErrors(result.errors);
    });
  };

  const resend = () =>
    startSending(async () => {
      const result = await sendLoginCode(codeSentTo ?? input.email);
      setErrors(result.errors);
    });

  return (
    <div className="grid gap-8">
      <Button type="button" variant="outline" onClick={google} disabled={sending} className="w-fit">
        Continue with Google
      </Button>

      <p className="flex items-center gap-4 text-text-3 before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">or use your email</p>

      <form noValidate onSubmit={send} className="grid gap-6">
        <SegmentedToggle
          label="How to log in"
          value={method}
          onChange={choose}
          options={[
            { value: "password", label: "Password" },
            { value: "code", label: "Email me a code" },
          ]}
          className="w-fit"
        />
        <ErrorSummary ref={summaryRef} errors={errors} />

        {method === "code" && codeSentTo ? (
          <>
            <p role="status" className="text-text-2">
              If there is an account for <strong className="text-ink">{codeSentTo}</strong>, we have emailed it a login code. It works for one hour.
            </p>
            <TextField
              ref={codeRef}
              id="code"
              label="Code from the email"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              error={errorFor("code")}
            />
          </>
        ) : (
          <TextField id="email" label="Email address" type="email" autoComplete="email" value={input.email} onChange={set("email")} error={errorFor("email")} />
        )}

        {method === "password" && (
          <TextField
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={input.password}
            onChange={set("password")}
            error={errorFor("password")}
          />
        )}

        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <Button type="submit" disabled={sending}>
            {sending ? "Please wait…" : method === "code" && !codeSentTo ? "Send me a code" : "Log in"}
          </Button>
          {method === "password" && (
            <Link href="/forgot-password" className="font-semibold text-ink underline underline-offset-4">
              Forgotten your password?
            </Link>
          )}
          {method === "code" && codeSentTo && (
            <>
              <button type="button" onClick={resend} disabled={sending} className="min-h-11 cursor-pointer font-semibold text-ink underline underline-offset-4">
                Send a new code
              </button>
              <button type="button" onClick={() => choose("code")} className="min-h-11 cursor-pointer font-semibold text-ink underline underline-offset-4">
                Use a different email
              </button>
            </>
          )}
        </div>
      </form>

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
    </div>
  );
}
