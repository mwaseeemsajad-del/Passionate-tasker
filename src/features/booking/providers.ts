"use server";

import { supabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Trade } from "@/types/content";

/** What a customer sees about a tradesperson they can choose. Never contact details. */
export type ProviderOption = { id: string; name: string; area: string; about: string; jobsDone: number; registered: string; languages: string[] };

/**
 * Approved tradespeople for this trade who work on that day and at that
 * time (once chosen), nearest to the postcode first, at most six. Empty when there are none yet, in which case we choose for the
 * customer (automatically, or the team does).
 */
export async function listProviders(trade: Trade, postcode: string, date: string, slot: string): Promise<ProviderOption[]> {
  if (!supabaseConfigured || !trade) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_available_providers", {
    p_trade: trade,
    p_postcode: postcode,
    p_date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
    p_slot: ["morning", "afternoon", "evening"].includes(slot) ? slot : null,
  });
  if (error || !Array.isArray(data)) return [];
  return data.map((r) => ({
    id: r.id as string,
    name: r.display_name as string,
    area: r.area as string,
    about: (r.about as string) ?? "",
    jobsDone: Number(r.jobs_done ?? 0),
    registered: (r.registered as string) ?? "",
    languages: (r.languages as string[]) ?? [],
  }));
}
