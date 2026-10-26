"use server";

import { supabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Trade } from "@/types/content";

/** What a customer sees about a tradesperson they can choose. Never contact details. */
export type ProviderOption = { id: string; name: string; area: string; about: string; jobsDone: number; registered: string };

/**
 * Approved tradespeople for this trade, nearest to the postcode first, at
 * most six. Empty when there are none yet, in which case we choose for the
 * customer (automatically, or the team does).
 */
export async function listProviders(trade: Trade, postcode: string): Promise<ProviderOption[]> {
  if (!supabaseConfigured || !trade) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_available_providers", { p_trade: trade, p_postcode: postcode });
  if (error || !Array.isArray(data)) return [];
  return data.map((r) => ({
    id: r.id as string,
    name: r.display_name as string,
    area: r.area as string,
    about: (r.about as string) ?? "",
    jobsDone: Number(r.jobs_done ?? 0),
    registered: (r.registered as string) ?? "",
  }));
}
