# 05: Accounts

**Status:** Not started
**Phase:** after the MVP launch
**Depends on:** 03
**Why it matters:** customers can see and manage their bookings; tradespeople can sign in.

## Checklist

- [ ] Supabase Auth: email magic link (no password to remember) and Google sign-in
- [ ] Two roles: customer and tradesperson; admin set by hand
- [ ] Customer area: my bookings, with status, date and who is coming
- [ ] A booking made while signed out can be claimed by signing in with the same email
- [ ] Sign-in pages built from `src/components/ui` forms; password managers and paste work; no CAPTCHA puzzles
- [ ] Route groups: `src/app/(account)/` for customers, `src/app/(pro)/` for tradespeople
- [ ] Every page and server action checks who is signed in and what they may see

## Done when

A customer can sign in, see only their own bookings, and sign out, on a phone
and with a screen reader.
