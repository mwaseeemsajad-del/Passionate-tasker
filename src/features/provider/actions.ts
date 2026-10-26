"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formatPostcode } from "@/features/booking/draft";
import { requireRole } from "@/features/accounts/data";
import type { FormError } from "@/features/accounts/validate";
import { createClient } from "@/lib/supabase/server";
import type { Trade } from "@/types/content";
import { registerChecks, validateRegistrations, validateTrades, type RegistrationsStep, type TradesStep } from "./onboarding";

export type StepResult = { ok: true } | { ok: false; errors: FormError[] };

const failed = (message: string): StepResult => ({ ok: false, errors: [{ id: "form", message }] });
const SAVE_FAILED = "We could not save that just now. Please try again in a minute.";

/** Step 1: trades and area. Adds the register checks the chosen trades need. */
export async function saveTrades(step: TradesStep): Promise<StepResult> {
  const viewer = await requireRole("provider");
  const errors = validateTrades(step);
  if (errors.length > 0) return { ok: false, errors };

  const supabase = await createClient();
  const { data: current } = await supabase.from("provider_profiles").select("onboarding_step").eq("id", viewer.id).single();
  const { error } = await supabase
    .from("provider_profiles")
    .update({
      trades: step.trades,
      postcode: formatPostcode(step.postcode),
      about: step.about.trim(),
      onboarding_step: Math.max(current?.onboarding_step ?? 0, 1),
      updated_at: new Date().toISOString(),
    })
    .eq("id", viewer.id);
  if (error) return failed(SAVE_FAILED);

  await addMissingChecks(viewer.id, step.trades);
  return { ok: true };
}

/** Step 2: registration numbers. */
export async function saveRegistrations(step: RegistrationsStep, trades: Trade[]): Promise<StepResult> {
  const viewer = await requireRole("provider");
  const errors = validateRegistrations(step, trades);
  if (errors.length > 0) return { ok: false, errors };

  const supabase = await createClient();
  const { data: current } = await supabase.from("provider_profiles").select("onboarding_step").eq("id", viewer.id).single();
  const { error } = await supabase
    .from("provider_profiles")
    .update({
      gas_safe: step.gasSafe.replace(/\s/g, ""),
      electrical_scheme: step.electricalScheme.trim(),
      onboarding_step: Math.max(current?.onboarding_step ?? 0, 2),
      updated_at: new Date().toISOString(),
    })
    .eq("id", viewer.id);
  return error ? failed(SAVE_FAILED) : { ok: true };
}

/** Step 3: agreeing to the checks finishes onboarding and opens the dashboard. */
export async function finishOnboarding(agree: boolean): Promise<StepResult> {
  const viewer = await requireRole("provider");
  if (!agree) return { ok: false, errors: [{ id: "agree", message: "Tick the box to say we may carry out these checks" }] };

  const supabase = await createClient();
  const { error } = await supabase
    .from("provider_profiles")
    .update({ onboarding_step: 3, onboarded_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", viewer.id);
  if (error) return failed(SAVE_FAILED);
  revalidatePath("/provider");
  redirect("/provider?welcome=1");
}

/** A provider tells us a document is on its way, so the team knows to look for it. */
export async function markCheckSubmitted(checkId: string): Promise<StepResult> {
  const viewer = await requireRole("provider");
  const supabase = await createClient();
  const { error } = await supabase
    .from("provider_checks")
    .update({ status: "submitted", updated_at: new Date().toISOString() })
    .eq("id", checkId)
    .eq("provider_id", viewer.id);
  if (error) return failed(SAVE_FAILED);
  revalidatePath("/provider");
  return { ok: true };
}

/** Accept or decline a job the team has offered. The database checks it is really offered to this provider. */
export async function respondToJob(bookingId: string, accept: boolean): Promise<StepResult> {
  await requireRole("provider");
  const supabase = await createClient();
  const { error } = await supabase.rpc("respond_to_booking", { p_booking: bookingId, p_accept: accept });
  if (error) return failed("This job is no longer waiting for your answer. Refresh the page to see the latest.");
  revalidatePath("/provider");
  return { ok: true };
}

export async function completeJob(bookingId: string): Promise<StepResult> {
  await requireRole("provider");
  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_booking", { p_booking: bookingId });
  if (error) return failed("Only a booked job can be marked as done.");
  revalidatePath("/provider");
  return { ok: true };
}

async function addMissingChecks(providerId: string, trades: Trade[]) {
  const kinds = registerChecks(trades);
  if (kinds.length === 0) return;
  const supabase = await createClient();
  const { data: existing } = await supabase.from("provider_checks").select("kind").eq("provider_id", providerId);
  const have = new Set((existing ?? []).map((c) => c.kind));
  const missing = kinds.filter((k) => !have.has(k));
  if (missing.length > 0) await supabase.from("provider_checks").insert(missing.map((kind) => ({ provider_id: providerId, kind })));
}
