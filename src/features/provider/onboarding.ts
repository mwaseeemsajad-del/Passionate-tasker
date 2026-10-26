import { isPostcodeOk } from "@/features/booking/draft";
import type { CheckKind } from "@/types/accounts";
import type { Trade } from "@/types/content";
import type { FormError } from "@/features/accounts/validate";

/*
 * Tradesperson onboarding: three short steps after the account is created.
 *   1. Trades and area
 *   2. Registrations (only asked for the trades that need them)
 *   3. Checks: agree to them, and see what to have ready
 * Each step is saved on its own, so a person can stop and come back.
 */

export const ONBOARDING_STEPS = ["Your trades and area", "Your registrations", "Your checks"] as const;

export type TradesStep = { trades: Trade[]; postcode: string; about: string };
export type RegistrationsStep = { gasSafe: string; electricalScheme: string };

/** Gas, boiler and heating work needs a Gas Safe number by law. */
export const needsGasSafe = (trades: Trade[]) => trades.includes("gas") || trades.includes("heating");
export const needsElectrical = (trades: Trade[]) => trades.includes("electrical");

/** The register checks a provider's trades add to the three everyone has. */
export function registerChecks(trades: Trade[]): CheckKind[] {
  return [...(needsGasSafe(trades) ? (["gas-safe"] as const) : []), ...(needsElectrical(trades) ? (["electrical"] as const) : [])];
}

export function validateTrades(s: TradesStep): FormError[] {
  const errors: FormError[] = [];
  if (s.trades.length === 0) errors.push({ id: "trades-group", message: "Choose at least one trade" });
  if (!isPostcodeOk(s.postcode)) errors.push({ id: "postcode", message: "Enter the postcode you work from, like SE15 or SE15 4QF" });
  if (s.about.length > 2000) errors.push({ id: "about", message: "Keep this under 2,000 characters" });
  return errors;
}

export function validateRegistrations(s: RegistrationsStep, trades: Trade[]): FormError[] {
  const errors: FormError[] = [];
  if (needsGasSafe(trades) && !/^\d{6,7}$/.test(s.gasSafe.replace(/\s/g, ""))) {
    errors.push({ id: "gasSafe", message: "Enter your Gas Safe licence number, the 7 digits on your ID card" });
  }
  if (needsElectrical(trades) && !s.electricalScheme.trim()) {
    errors.push({ id: "electricalScheme", message: "Enter your scheme and membership number, like NICEIC 123456" });
  }
  return errors;
}
