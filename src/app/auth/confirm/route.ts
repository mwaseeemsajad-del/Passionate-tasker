import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { homeFor } from "@/features/accounts/data";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/types/accounts";

/*
 * The link in the "confirm your email" message lands here. Exchanges the code
 * (or token) for a session, then sends the person on: providers to
 * onboarding, customers to their account. Add this URL to Supabase:
 * Authentication > URL Configuration > Redirect URLs.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = searchParams.get("next");
  // Only paths on this site, never another host.
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;

  const supabase = await createClient();
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      : { error: new Error("missing code") };

  if (error) return NextResponse.redirect(`${origin}/login?error=link`);
  const { data: claims } = await supabase.auth.getClaims();
  const { data: profile } = await supabase.from("profiles").select("role, phone").eq("id", claims?.claims?.sub ?? "").maybeSingle();
  // A new Google account has no phone yet: choose customer or tradesperson first.
  if (profile && !profile.phone && claims?.claims?.app_metadata?.provider === "google") return NextResponse.redirect(`${origin}/welcome`);
  if (safeNext) return NextResponse.redirect(`${origin}${safeNext}`);
  // No ?next= (Google sign-in from the login page): go to the person's own home.
  return NextResponse.redirect(`${origin}${homeFor((profile?.role as Role) ?? "customer")}`);
}
