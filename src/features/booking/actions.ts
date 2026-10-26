"use server";

import { DAYS_AHEAD, upcomingDays, validateStep, type Draft, type FieldError } from "./draft";

export type SubmitResult = { ok: true; reference: string } | { ok: false; errors: FieldError[] };

/*
 * Receives a booking request. The server checks every answer again: the
 * browser's checks are for the person's convenience, these are the real ones.
 *
 * TODO(Supabase): insert into the `booking_requests` table here and return
 * its reference. Until then nothing is stored and no one is contacted.
 */
export async function submitBookingRequest(draft: Draft): Promise<SubmitResult> {
  // One day either side, so a request sent just before midnight in another
  // time zone is not rejected.
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const days = upcomingDays(DAYS_AHEAD + 2, yesterday);

  const errors = [0, 1, 2].flatMap((step) => validateStep(step, draft, days));
  if (errors.length > 0) return { ok: false, errors };

  const reference = `PT${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  return { ok: true, reference };
}
