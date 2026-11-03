"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/types/accounts";
import { isPhone } from "@/features/booking/draft";
import { homeFor } from "./data";
import { MIN_PASSWORD, safeNext, validateLogin, validateSignUp, type FormError, type LoginInput, type SignUpInput } from "./validate";

export type AuthResult = { ok: false; errors: FormError[] } | { ok: true; checkEmail: string };

/** Where a new account goes once the email is confirmed. */
const afterConfirm = (role: Role) => (role === "provider" ? "/provider/onboarding" : "/account");

/**
 * Create a customer or provider account. The role goes in the sign-up
 * metadata; a database trigger turns it into the profile row, and the
 * database never lets the person change it afterwards.
 */
export async function signUp(role: Role, input: SignUpInput): Promise<AuthResult> {
  // Team accounts are made in the database by hand, never from the site.
  if (role !== "customer" && role !== "provider") return { ok: false, errors: [{ id: "email", message: "This kind of account cannot be created here" }] };
  const errors = validateSignUp(input);
  if (errors.length > 0) return { ok: false, errors };

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: { role, full_name: input.fullName.trim(), phone: input.phone.trim() },
      emailRedirectTo: `${origin}/auth/confirm?next=${afterConfirm(role)}`,
    },
  });

  if (error) {
    const message = /already registered|already exists/i.test(error.message)
      ? "There is already an account with this email address. Log in instead."
      : /password/i.test(error.message)
        ? "Choose a longer password, with letters and numbers"
        : "We could not create the account just now. Please try again in a minute.";
    return { ok: false, errors: [{ id: /password/i.test(error.message) ? "password" : "email", message }] };
  }

  // Email confirmation switched off in Supabase: the account is ready now.
  if (data.session) redirect(afterConfirm(role));
  return { ok: true, checkEmail: input.email.trim() };
}

export async function logIn(input: LoginInput, next?: string | null): Promise<{ ok: false; errors: FormError[] }> {
  const errors = validateLogin(input);
  if (errors.length > 0) return { ok: false, errors };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email: input.email.trim(), password: input.password });
  if (error || !data.user) {
    const message = /confirm/i.test(error?.message ?? "")
      ? "Please confirm your email address first. We sent you a link when you signed up."
      : "The email address or password is not right";
    return { ok: false, errors: [{ id: "email", message }] };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  redirect(safeNext(next) ?? homeFor((profile?.role as Role) ?? "customer"));
}

/**
 * Email a one-time login code. Supabase sends it through the SMTP set in the
 * dashboard (Resend). Existing accounts only: sign-up collects name and phone.
 * Says "sent" for unknown emails too, so the form cannot reveal who has an account.
 */
export async function sendLoginCode(email: string): Promise<{ ok: boolean; errors: FormError[] }> {
  const errors = validateLogin({ email, password: "x" });
  if (errors.length > 0) return { ok: false, errors };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false } });
  if (error?.status === 429) return { ok: false, errors: [{ id: "email", message: "We sent a code a moment ago. Wait a minute, then ask for a new one." }] };
  return { ok: true, errors: [] };
}

export async function verifyLoginCode(email: string, code: string, next?: string | null): Promise<{ ok: false; errors: FormError[] }> {
  const token = code.replace(/\s/g, "");
  if (!/^\d{6,10}$/.test(token)) return { ok: false, errors: [{ id: "code", message: "Enter the code from the email, like 123456" }] };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ email: email.trim(), token, type: "email" });
  if (error || !data.user) return { ok: false, errors: [{ id: "code", message: "That code is not right or has run out. Check the email, or ask for a new code." }] };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  redirect(safeNext(next) ?? homeFor((profile?.role as Role) ?? "customer"));
}

/** Start Google sign-in. New Google accounts become customers (the profile trigger's default). */
export async function signInWithGoogle(next?: string | null): Promise<{ ok: false; message: string }> {
  const origin = (await headers()).get("origin") ?? "";
  const after = safeNext(next);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/confirm${after ? `?next=${encodeURIComponent(after)}` : ""}` },
  });
  if (error || !data.url) return { ok: false, message: "Google sign-in is not available just now. Log in with your email instead." };
  redirect(data.url);
}

/** First Google sign-in: pick customer or tradesperson and give a phone number. The database allows this once. */
export async function finishGoogleSignup(role: string, phone: string): Promise<{ ok: false; errors: FormError[] }> {
  const errors: FormError[] = [];
  if (role !== "customer" && role !== "provider") errors.push({ id: "role-group", message: "Choose how you will use Passionate Taskers" });
  if (!isPhone(phone)) errors.push({ id: "phone", message: "Enter a phone number with at least 10 digits, like 07700 900123" });
  if (errors.length > 0) return { ok: false, errors };

  const supabase = await createClient();
  const { error } = await supabase.rpc("finish_google_signup", { p_role: role, p_phone: phone.trim() });
  if (error) return { ok: false, errors: [{ id: "phone", message: "We could not save this just now. Please try again, or call us." }] };
  redirect(afterConfirm(role as Role));
}

/** A customer cancels one of their own requests. The database checks it is theirs and not finished. */
export async function cancelBooking(bookingId: string): Promise<{ ok: boolean; message?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_booking", { p_booking: bookingId });
  if (error) return { ok: false, message: "This request can no longer be cancelled online. Please call us." };
  revalidatePath("/account");
  return { ok: true };
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/**
 * Send a password reset link. Always says it was sent, so the form cannot be
 * used to find out which email addresses have an account.
 */
export async function requestPasswordReset(email: string): Promise<{ ok: boolean; errors: FormError[] }> {
  const errors = validateLogin({ email, password: "x" });
  if (errors.length > 0) return { ok: false, errors };
  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${origin}/auth/confirm?next=/reset-password` });
  return { ok: true, errors: [] };
}

/** Set a new password. Needs the session the reset link created. */
export async function updatePassword(password: string): Promise<{ ok: false; errors: FormError[] }> {
  if (password.length < MIN_PASSWORD) return { ok: false, errors: [{ id: "password", message: `Choose a password of at least ${MIN_PASSWORD} characters` }] };
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return { ok: false, errors: [{ id: "password", message: "This reset link has run out. Ask for a new one." }] };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, errors: [{ id: "password", message: "Choose a different password, at least 8 characters with letters and numbers" }] };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", claims.claims.sub).maybeSingle();
  redirect(homeFor((profile?.role as Role) ?? "customer"));
}
