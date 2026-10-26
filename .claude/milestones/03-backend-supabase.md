# 03: Backend on Supabase

**Status:** Built 26 October 2026. Waiting on: the SQL being run in Supabase, and the team email (N2) for notifications
**Phase:** MVP
**Depends on:** 01
**Why it matters:** today nothing is saved. This milestone makes a booking a real request.

## Shape

- Supabase for the database (Postgres), and later for auth and file storage.
- Writes happen on our server only, through the existing server action
  `submitBookingRequest` in `src/features/booking/actions.ts`. The browser never
  writes to the database directly.
- Server code lives under `src/server/` (database client, queries, email).

## Checklist

### Setup
- [x] Supabase project created by the client; URL and publishable key in `.env.local`. The service role key is not used at all
- [x] `.env.example` listing every variable, with no values
- [x] Supabase clients in `src/lib/supabase/` (server, browser, proxy). Schema in `supabase/migrations/`

### Tables (first slice)
- [x] `booking_requests` (status: new, offered, accepted, declined, completed, cancelled), plus `profiles`, `provider_profiles`, `provider_checks` for accounts
- [ ] `waitlist`: email, role (customer or tradesperson), trade, postcode, created_at
- [x] Replaced by tradesperson accounts and onboarding (`provider_profiles`)
- [x] Row level security on every table: people read only their own rows; writes only through checked database functions and column grants

### Features
- [x] `submitBookingRequest` saves the request and returns its reference (linked to the account when signed in)
- [ ] Email to the team for every new request (provider: Resend, or Supabase's own if preferred)
- [ ] Confirmation email to the customer when they gave an email address
- [x] Rate limit: 5 requests an hour per phone number, in the database function, no CAPTCHA
- [x] The confirmation screen and the voice guide stop saying "this is a demo" once Supabase is configured

### Admin
- [x] `/admin`: requests grouped by what to do next, offer a job to an approved tradesperson, cancel, reopen, mark done; approve each check and each tradesperson
- [x] Only admin accounts can open it; admins are made by hand in SQL (see `0002_team_admin.sql`)

## Done when

A booking made on the live site, by voice or with the form, appears in
Supabase and in the team's inbox within a minute, and the admin list shows it.
