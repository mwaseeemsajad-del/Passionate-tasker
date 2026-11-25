"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Button, CheckboxGroup, ChoiceGroup, ErrorSummary, FieldError, StepProgress, TextAreaField, TextField } from "@/components/ui";
import { services } from "@/data/services";
import { checks as checkCopy } from "@/data/trust";
import type { FormError } from "@/features/accounts/validate";
import { SLOTS, type SlotId } from "@/features/booking/draft";
import type { BusinessType, ProviderProfile } from "@/types/accounts";
import type { Trade } from "@/types/content";
import { finishOnboarding, saveRegistrations, saveTrades } from "../actions";
import { BUSINESS_TYPES, DAYS, LANGUAGES, ONBOARDING_STEPS, needsElectrical, needsGasSafe, registerChecks, validateRegistrations, validateTrades } from "../onboarding";

/*
 * The three onboarding steps on one page. Each step saves before moving on,
 * and focus goes to the new step's heading, as in the booking form.
 */
export function OnboardingWizard({ profile }: { profile: ProviderProfile }) {
  const [step, setStep] = useState(Math.min(profile.onboardingStep, 2));
  const [trades, setTrades] = useState<Trade[]>(profile.trades);
  const [postcode, setPostcode] = useState(profile.postcode);
  const [about, setAbout] = useState(profile.about);
  const [gasSafe, setGasSafe] = useState(profile.gasSafe);
  const [electricalScheme, setElectricalScheme] = useState(profile.electricalScheme);
  const [languages, setLanguages] = useState<string[]>(profile.languages);
  const [availableDays, setAvailableDays] = useState<number[]>(profile.availableDays);
  const [availableSlots, setAvailableSlots] = useState<SlotId[]>(profile.availableSlots);
  const [businessType, setBusinessType] = useState<BusinessType>(profile.businessType);
  const [businessName, setBusinessName] = useState(profile.businessName);
  const [companyNumber, setCompanyNumber] = useState(profile.companyNumber);
  const [businessAddress, setBusinessAddress] = useState(profile.businessAddress);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<FormError[]>([]);
  const [saving, startSaving] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  const errorFor = (id: string) => errors.find((e) => e.id === id)?.message;
  const tradesStep = { trades, postcode, about, languages, availableDays, availableSlots };
  const businessStep = { gasSafe, electricalScheme, businessType, businessName, companyNumber, businessAddress };

  useEffect(() => {
    if (errors.length > 0) summaryRef.current?.focus();
  }, [errors]);
  useEffect(() => {
    if (moved.current) headingRef.current?.focus();
    moved.current = true;
  }, [step]);

  const goTo = (next: number) => {
    setErrors([]);
    setStep(next);
  };

  const run = (check: () => FormError[], save: () => Promise<{ ok: boolean; errors?: FormError[] } | void>, then?: () => void) => {
    const found = check();
    setErrors(found);
    if (found.length > 0) return;
    startSaving(async () => {
      const result = await save();
      if (result && !result.ok) setErrors(result.errors ?? []);
      else then?.();
    });
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (step === 0) {
      run(
        () => validateTrades(tradesStep),
        () => saveTrades(tradesStep),
        () => goTo(1),
      );
    } else if (step === 1) {
      run(
        () => validateRegistrations(businessStep, trades),
        () => saveRegistrations(businessStep, trades),
        () => goTo(2),
      );
    } else {
      run(() => (agree ? [] : [{ id: "agree", message: "Tick the box to say we may carry out these checks" }]), () => finishOnboarding(agree));
    }
  };

  const tradeChoices = services.map((s) => ({ value: s.slug, label: s.name, detail: s.registration }));
  const checkKinds = ["identity", "business", "dbs", "insurance", ...registerChecks(trades)];

  return (
    <section aria-labelledby="onboarding-step-title" className="grid gap-8">
      <StepProgress steps={ONBOARDING_STEPS} current={step} label="Joining steps" />
      <h2 id="onboarding-step-title" ref={headingRef} tabIndex={-1} className="text-h3 outline-none">
        <span className="block text-[0.9375rem] font-medium text-text-3">
          Step {step + 1} of {ONBOARDING_STEPS.length}
        </span>
        {ONBOARDING_STEPS[step]}
      </h2>

      <form noValidate onSubmit={submit} className="grid gap-8">
        <ErrorSummary ref={summaryRef} errors={errors.map((e) => (e.id === "form" ? { ...e, id: "onboarding-step-title" } : e))} />

        {step === 0 && (
          <>
            <CheckboxGroup
              name="trades"
              legend="Which trades do you do?"
              hint="Tick all that apply. Gas and certified electrical work need the right register."
              choices={tradeChoices}
              value={trades}
              onChange={(v) => setTrades(v as Trade[])}
              error={errorFor("trades-group")}
            />
            <TextField
              id="postcode"
              label="Postcode you work from"
              hint="We offer you jobs near here. The first part on its own is fine, like SE15."
              autoComplete="postal-code"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              error={errorFor("postcode")}
              className="max-w-xs"
            />
            <TextAreaField
              id="about"
              label="Tell us about your work"
              hint="How long you have been working, the areas you cover, and the jobs you like best."
              optional
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              error={errorFor("about")}
            />
            <CheckboxGroup
              name="languages"
              legend="Which languages can you speak with customers?"
              hint="Customers who prefer one of these see it on your profile."
              columns={3}
              choices={LANGUAGES.map((l) => ({ value: l, label: l }))}
              value={languages}
              onChange={setLanguages}
              error={errorFor("languages-group")}
            />
            <CheckboxGroup
              name="days"
              legend="Which days do you work?"
              hint="We only offer you jobs on these days."
              columns={3}
              choices={DAYS.map((d, i) => ({ value: String(i + 1), label: d }))}
              value={availableDays.map(String)}
              onChange={(v) => setAvailableDays(v.map(Number).sort())}
              error={errorFor("days-group")}
            />
            <CheckboxGroup
              name="slots"
              legend="What times of day do you work?"
              columns={3}
              choices={SLOTS.map((t) => ({ value: t.id, label: t.label, detail: t.hours }))}
              value={availableSlots}
              onChange={(v) => setAvailableSlots(v as SlotId[])}
              error={errorFor("slots-group")}
            />
          </>
        )}

        {step === 1 && (
          <>
            <ChoiceGroup
              name="businessType"
              legend="How is your business set up?"
              hint="We check this before your first job."
              columns={3}
              choices={BUSINESS_TYPES}
              value={businessType}
              onChange={(v) => setBusinessType(v as BusinessType)}
              error={errorFor("businessType-group")}
            />
            <TextField
              id="businessName"
              label={businessType === "sole_trader" ? "Trading name" : "Company or partnership name"}
              hint={businessType === "sole_trader" ? "Leave empty if you trade under your own name." : undefined}
              optional={businessType === "sole_trader"}
              autoComplete="organization"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              error={errorFor("businessName")}
            />
            {businessType === "limited" && (
              <TextField
                id="companyNumber"
                label="Companies House number"
                hint="8 characters, like 01234567 or SC123456. We look it up on the register."
                value={companyNumber}
                onChange={(e) => setCompanyNumber(e.target.value)}
                error={errorFor("companyNumber")}
                className="max-w-xs"
              />
            )}
            <TextAreaField
              id="businessAddress"
              label="Business address"
              hint="Where your business is registered or run from, with the postcode."
              autoComplete="street-address"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              error={errorFor("businessAddress")}
            />
            {needsGasSafe(trades) && (
              <TextField
                id="gasSafe"
                label="Gas Safe licence number"
                hint="The 7 digits on your Gas Safe ID card. We check it on the register ourselves."
                inputMode="numeric"
                value={gasSafe}
                onChange={(e) => setGasSafe(e.target.value)}
                error={errorFor("gasSafe")}
                className="max-w-xs"
              />
            )}
            {needsElectrical(trades) && (
              <TextField
                id="electricalScheme"
                label="Electrical scheme and membership number"
                hint="For example NICEIC 123456 or NAPIT 123456."
                value={electricalScheme}
                onChange={(e) => setElectricalScheme(e.target.value)}
                error={errorFor("electricalScheme")}
              />
            )}
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid gap-3">
              <p className="text-text-2">Before we offer you any job, we check these. Have them ready for when we call:</p>
              <ul className="grid divide-y divide-line border-y border-line">
                {checkKinds.map((kind) => {
                  const copy = checkCopy.find((c) => c.id === kind);
                  return copy ? (
                    <li key={kind} className="grid gap-1 py-4">
                      <h3 className="text-h4">{copy.title}</h3>
                      <p className="text-text-3">{copy.body[0]}</p>
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
            <div className="grid gap-2">
              {errorFor("agree") && <FieldError id="agree-error">{errorFor("agree")}</FieldError>}
              <label htmlFor="agree" className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-white p-4">
                <input
                  id="agree"
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  aria-invalid={errorFor("agree") ? true : undefined}
                  aria-describedby={errorFor("agree") ? "agree-error" : undefined}
                  className="mt-1 size-5 shrink-0 accent-ink"
                />
                <span>
                  I agree that Passionate Taskers may check my photo ID, my business details, a basic DBS certificate, my insurance and my trade registration before I
                  am offered any job, and again every year.
                </span>
              </label>
            </div>
          </>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : step === 2 ? "Finish and open my dashboard" : "Save and continue"}
          </Button>
          {step > 0 && (
            <button
              type="button"
              onClick={() => goTo(step - 1)}
              className="min-h-11 cursor-pointer px-2 font-medium underline underline-offset-4"
            >
              Back
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
