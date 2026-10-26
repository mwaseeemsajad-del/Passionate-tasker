import { getService, jobsFor } from "@/data/services";
import { SLOTS } from "@/features/booking/draft";
import type { BookingRequest, BookingStatus, CheckStatus, ProviderStatus } from "@/types/accounts";

/*
 * Every status in plain words, as each side sees it. A customer never sees
 * "declined": when a tradesperson says no, the team offers the job to someone
 * else, so for the customer it is still being arranged.
 */

export const customerStatus: Record<BookingStatus, string> = {
  new: "Request received. We will call you to confirm",
  offered: "We are arranging a tradesperson",
  declined: "We are arranging a tradesperson",
  accepted: "Booked. A checked tradesperson is coming",
  completed: "Done",
  cancelled: "Cancelled",
};

export const providerStatus: Record<BookingStatus, string> = {
  new: "New",
  offered: "Waiting for your answer",
  accepted: "Booked",
  declined: "You declined",
  completed: "Done",
  cancelled: "Cancelled by the customer",
};

export const checkStatus: Record<CheckStatus, string> = {
  not_started: "To do",
  submitted: "Sent, we are checking",
  approved: "Checked",
  rejected: "Needs attention",
};

export const accountStatus: Record<ProviderStatus, string> = {
  pending_checks: "Checks in progress",
  approved: "Approved for jobs",
  paused: "Paused",
};

/** "Hang wallpaper", from the job's slug. */
export const jobName = (b: Pick<BookingRequest, "trade" | "job">) => jobsFor(b.trade).find((j) => j.slug === b.job)?.name ?? b.job;
export const tradeName = (b: Pick<BookingRequest, "trade">) => getService(b.trade)?.name ?? b.trade;

/** "Friday 30 October, afternoon (12pm to 5pm)", in UK English. */
export function when(b: Pick<BookingRequest, "preferredDate" | "slot">): string {
  const day = new Date(`${b.preferredDate}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const slot = SLOTS.find((s) => s.id === b.slot);
  return slot ? `${day}, ${slot.label.toLowerCase()} (${slot.hours})` : day;
}

/** Just the area, "SE15", before a provider has accepted the job. */
export const postcodeArea = (postcode: string) => postcode.trim().split(/\s+/)[0];
