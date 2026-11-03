"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Button, ChoiceGroup, ErrorSummary, TextField } from "@/components/ui";
import { finishGoogleSignup } from "../actions";
import type { FormError } from "../validate";

/** After the first Google sign-in: customer or tradesperson, and a phone number. */
export function WelcomeForm() {
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<FormError[]>([]);
  const [sending, startSending] = useTransition();
  const summaryRef = useRef<HTMLDivElement>(null);
  const errorFor = (id: string) => errors.find((e) => e.id === id)?.message;

  useEffect(() => {
    if (errors.length > 0) summaryRef.current?.focus();
  }, [errors]);

  const send = (event: React.FormEvent) => {
    event.preventDefault();
    startSending(async () => {
      // Redirects on success; only comes back with errors.
      const result = await finishGoogleSignup(role, phone);
      if (result && !result.ok) setErrors(result.errors);
    });
  };

  return (
    <form noValidate onSubmit={send} className="grid gap-6">
      <ErrorSummary ref={summaryRef} errors={errors} />
      <ChoiceGroup
        name="role"
        legend="How will you use Passionate Taskers?"
        hint="You cannot change this later."
        error={errorFor("role-group")}
        value={role}
        onChange={setRole}
        choices={[
          { value: "customer", label: "I need a job done", detail: "Book checked local tradespeople" },
          { value: "provider", label: "I am a tradesperson", detail: "Get jobs near you. We check your details first." },
        ]}
      />
      <TextField
        id="phone"
        label="Phone number"
        hint="So the tradesperson or our team can call you about a job"
        type="tel"
        autoComplete="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={errorFor("phone")}
      />
      <Button type="submit" disabled={sending} className="w-fit">
        {sending ? "Saving…" : "Continue"}
      </Button>
    </form>
  );
}
