/*
 * The booking draft: what the booking form collects, how each step is
 * checked, and how answers are kept for the browser tab. Shared by the form
 * and the voice guide, so both fill in exactly the same booking.
 */

import { getService, jobsFor } from "@/data/services";
import type { Trade } from "@/types/content";

export type SlotId = "morning" | "afternoon" | "evening";

export const SLOTS: { id: SlotId; label: string; hours: string }[] = [
  { id: "morning", label: "Morning", hours: "8am to 12pm" },
  { id: "afternoon", label: "Afternoon", hours: "12pm to 5pm" },
  { id: "evening", label: "Evening", hours: "5pm to 8pm" },
];

export const STEPS = ["The job", "When", "Your details", "Check and send"] as const;

export type Draft = {
  step: number;
  trade: Trade | "";
  job: string;
  postcode: string;
  details: string;
  date: string;
  slot: SlotId | "";
  name: string;
  phone: string;
  email: string;
};

export const EMPTY_DRAFT: Draft = {
  step: 0,
  trade: "",
  job: "",
  postcode: "",
  details: "",
  date: "",
  slot: "",
  name: "",
  phone: "",
  email: "",
};

export const POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
/** The first half of a postcode ("SW2"). Enough to find a tradesperson; the team confirms the rest by phone. */
export const POSTCODE_AREA = /^[A-Z]{1,2}\d[A-Z\d]?$/i;
export const isPostcodeOk = (value: string) => POSTCODE.test(value.trim()) || POSTCODE_AREA.test(value.trim());
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isPhone = (value: string) => value.replace(/\D/g, "").length >= 10;

/** "sw21aa" → "SW2 1AA"; an area on its own ("sw1a") → "SW1A". */
export function formatPostcode(value: string): string {
  const compact = value.replace(/\s+/g, "").toUpperCase();
  return POSTCODE.test(compact) ? `${compact.slice(0, -3)} ${compact.slice(-3)}` : compact;
}

export type Day = { iso: string; label: string; long: string; weekday: string };

/** Today and the next few days, labelled the way people say them. */
export function upcomingDays(count: number, from = new Date()): Day[] {
  const short = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });
  const long = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "long" });
  const start = new Date(from);
  start.setHours(12, 0, 0, 0);

  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const prefix = i === 0 ? "Today, " : i === 1 ? "Tomorrow, " : "";
    return {
      iso,
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : short.format(d),
      long: prefix + long.format(d),
      weekday: weekday.format(d).toLowerCase(),
    };
  });
}

export const DAYS_AHEAD = 7;

export type FieldError = { id: string; message: string };

/** What is missing or wrong on a step. Field ids match the inputs, so errors can link to them. */
export function validateStep(step: number, d: Draft, days: Day[]): FieldError[] {
  const errors: FieldError[] = [];
  if (step === 0) {
    if (!d.trade) errors.push({ id: "trade-group", message: "Choose the kind of tradesperson you need" });
    else if (!jobsFor(d.trade).some((j) => j.slug === d.job)) errors.push({ id: "job-group", message: "Choose the job, or Something else" });
    if (!d.postcode.trim()) errors.push({ id: "postcode", message: "Enter the postcode where the job is" });
    else if (!isPostcodeOk(d.postcode)) errors.push({ id: "postcode", message: "Enter a UK postcode like SW2 1AA, or at least the first part, like SW2" });
    if (d.job === "something-else" && !d.details.trim()) errors.push({ id: "details", message: "Tell us what needs doing" });
  }
  if (step === 1) {
    if (!days.some((day) => day.iso === d.date)) errors.push({ id: "date-group", message: "Choose a day" });
    if (!d.slot) errors.push({ id: "slot-group", message: "Choose a time of day" });
  }
  if (step === 2) {
    if (!d.name.trim()) errors.push({ id: "name", message: "Enter your name" });
    if (!d.phone.trim()) errors.push({ id: "phone", message: "Enter a phone number so the tradesperson can call you" });
    else if (!isPhone(d.phone)) errors.push({ id: "phone", message: "Enter a phone number with at least 10 digits, like 07700 900123" });
    if (d.email.trim() && !EMAIL.test(d.email.trim())) errors.push({ id: "email", message: "Enter an email address like name@example.com, or leave it empty" });
  }
  return errors;
}

/** Plain-English pieces of the booking, used by the summary and the voice guide. */
export function describe(d: Draft, days: Day[]) {
  const service = getService(d.trade);
  const job = jobsFor(d.trade).find((j) => j.slug === d.job);
  const day = days.find((x) => x.iso === d.date);
  const slot = SLOTS.find((s) => s.id === d.slot);
  return { service, job, day, slot };
}

/* ---- Keeping the draft for this tab ---- */

const STORAGE_KEY = "pt-booking-draft";

export function loadDraft(): Draft {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return { ...EMPTY_DRAFT, ...(JSON.parse(raw) as Partial<Draft>) };
  } catch {
    /* blocked or corrupt storage: start fresh */
  }
  return EMPTY_DRAFT;
}

export function saveDraft(d: Draft) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch {
    /* storage blocked: the booking still works, it just will not survive a reload */
  }
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
}
