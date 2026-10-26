import { EMAIL, isPhone } from "@/features/booking/draft";

/*
 * Checks for the sign-up and login forms. Run in the browser for a quick
 * answer and again on the server, where they count.
 */

export type FormError = { id: string; message: string };

export type SignUpInput = { fullName: string; phone: string; email: string; password: string };
export type LoginInput = { email: string; password: string };

export const MIN_PASSWORD = 8;

export function validateSignUp(i: SignUpInput): FormError[] {
  const errors: FormError[] = [];
  if (!i.fullName.trim()) errors.push({ id: "fullName", message: "Enter your full name" });
  if (!i.phone.trim()) errors.push({ id: "phone", message: "Enter a phone number we can call you on" });
  else if (!isPhone(i.phone)) errors.push({ id: "phone", message: "Enter a phone number with at least 10 digits, like 07700 900123" });
  errors.push(...validateEmail(i.email));
  if (i.password.length < MIN_PASSWORD) errors.push({ id: "password", message: `Choose a password of at least ${MIN_PASSWORD} characters` });
  return errors;
}

export function validateLogin(i: LoginInput): FormError[] {
  const errors = validateEmail(i.email);
  if (!i.password) errors.push({ id: "password", message: "Enter your password" });
  return errors;
}

function validateEmail(email: string): FormError[] {
  if (!email.trim()) return [{ id: "email", message: "Enter your email address" }];
  if (!EMAIL.test(email.trim())) return [{ id: "email", message: "Enter an email address like name@example.com" }];
  return [];
}

/** A path on this site to go to after login, or null. Never another host. */
export function safeNext(next: string | null | undefined): string | null {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}
