import { isPostcodeOk } from "@/features/booking/draft";
import type { SlotId } from "@/features/booking/draft";
import type { BusinessType, CheckKind } from "@/types/accounts";
import type { Trade } from "@/types/content";
import type { FormError } from "@/features/accounts/validate";

/*
 * Tradesperson onboarding: three short steps after the account is created.
 *   1. Trades, area, languages and the days and times they work
 *   2. Business details, and registrations for the trades that need them
 *   3. Checks: agree to them, and see what to have ready
 * Each step is saved on its own, so a person can stop and come back.
 */

export const ONBOARDING_STEPS = ["Your trades, area and hours", "Your business and registrations", "Your checks"] as const;

export type TradesStep = { trades: Trade[]; postcode: string; about: string; languages: string[]; availableDays: number[]; availableSlots: SlotId[] };
export type RegistrationsStep = {
  gasSafe: string;
  electricalScheme: string;
  businessType: BusinessType;
  businessName: string;
  companyNumber: string;
  businessAddress: string;
};

/** Languages a tradesperson can offer, the most spoken in the UK first. */
export const LANGUAGES = ["English", "Welsh", "Polish", "Romanian", "Punjabi", "Urdu", "Bengali", "Gujarati", "Arabic", "Portuguese", "Spanish", "Italian", "Lithuanian", "Turkish", "French", "Tamil", "Somali", "British Sign Language"];
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const BUSINESS_TYPES: { value: Exclude<BusinessType, "">; label: string }[] = [
  { value: "sole_trader", label: "Sole trader" },
  { value: "limited", label: "Limited company" },
  { value: "partnership", label: "Partnership" },
];

/** Companies House numbers: 8 characters, like 01234567 or SC123456. */
export const normaliseCompanyNumber = (v: string) => {
  const n = v.replace(/\s/g, "").toUpperCase();
  return /^\d{1,7}$/.test(n) ? n.padStart(8, "0") : n;
};

/** Gas, boiler and heating work needs a Gas Safe number by law. */
export const needsGasSafe = (trades: Trade[]) => trades.includes("gas") || trades.includes("heating");
export const needsElectrical = (trades: Trade[]) => trades.includes("electrical");

/** The register checks a provider's trades add to the four everyone has. */
export function registerChecks(trades: Trade[]): CheckKind[] {
  return [...(needsGasSafe(trades) ? (["gas-safe"] as const) : []), ...(needsElectrical(trades) ? (["electrical"] as const) : [])];
}

export function validateTrades(s: TradesStep): FormError[] {
  const errors: FormError[] = [];
  if (s.trades.length === 0) errors.push({ id: "trades-group", message: "Choose at least one trade" });
  if (!isPostcodeOk(s.postcode)) errors.push({ id: "postcode", message: "Enter the postcode you work from, like SE15 or SE15 4QF" });
  if (s.about.length > 2000) errors.push({ id: "about", message: "Keep this under 2,000 characters" });
  if (s.languages.length === 0) errors.push({ id: "languages-group", message: "Choose at least one language you speak with customers" });
  if (s.availableDays.length === 0) errors.push({ id: "days-group", message: "Choose at least one day you work" });
  if (s.availableSlots.length === 0) errors.push({ id: "slots-group", message: "Choose at least one time of day you work" });
  return errors;
}

export function validateRegistrations(s: RegistrationsStep, trades: Trade[]): FormError[] {
  const errors: FormError[] = [];
  if (!s.businessType) errors.push({ id: "businessType-group", message: "Choose how your business is set up" });
  if (s.businessType && s.businessType !== "sole_trader" && !s.businessName.trim()) {
    errors.push({ id: "businessName", message: "Enter the name of your company or partnership" });
  }
  if (s.businessName.length > 160) errors.push({ id: "businessName", message: "Keep the business name under 160 characters" });
  if (s.businessType === "limited" && !/^[A-Z0-9]{8}$/.test(normaliseCompanyNumber(s.companyNumber))) {
    errors.push({ id: "companyNumber", message: "Enter your 8-character Companies House number, like 01234567 or SC123456" });
  }
  if (s.businessAddress.trim().length < 8) errors.push({ id: "businessAddress", message: "Enter your business address, with the postcode" });
  if (s.businessAddress.length > 300) errors.push({ id: "businessAddress", message: "Keep the address under 300 characters" });
  if (needsGasSafe(trades) && !/^\d{6,7}$/.test(s.gasSafe.replace(/\s/g, ""))) {
    errors.push({ id: "gasSafe", message: "Enter your Gas Safe licence number, the 7 digits on your ID card" });
  }
  if (needsElectrical(trades) && !s.electricalScheme.trim()) {
    errors.push({ id: "electricalScheme", message: "Enter your scheme and membership number, like NICEIC 123456" });
  }
  return errors;
}
