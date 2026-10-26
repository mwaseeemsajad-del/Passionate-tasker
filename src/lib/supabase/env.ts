/*
 * The two public Supabase settings. Both are safe in the browser: the
 * publishable key only does what Row Level Security allows. The secret
 * (service role) key is never used by this app.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);
