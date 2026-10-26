# 03: Backend on Supabase

**Status:** Not started, waiting on the Supabase keys (N1) and the team email (N2)
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
- [ ] Supabase project created by the client; URL and anon key in `.env.local`, service role key only in Vercel's server environment
- [ ] `.env.example` listing every variable, with no values
- [ ] Supabase client for server code in `src/server/supabase.ts`

### Tables (first slice)
- [ ] `booking_requests`: reference, trade, job, postcode, details, date, time slot, name, phone, email, booked_by_voice, status (new, contacted, booked, done, cancelled), created_at
- [ ] `waitlist`: email, role (customer or tradesperson), trade, postcode, created_at
- [ ] `tradesperson_interest`: name, phone, email, trades, area, registrations they hold, created_at
- [ ] Row level security on every table: no public read; inserts only through the server

### Features
- [ ] `submitBookingRequest` saves the request and returns its reference
- [ ] Email to the team for every new request (provider: Resend, or Supabase's own if preferred)
- [ ] Confirmation email to the customer when they gave an email address
- [ ] Rate limit on the booking action (for example 5 requests per hour per IP) to stop spam, with no CAPTCHA puzzles
- [ ] The confirmation screen and the voice guide stop saying "this is a demo"

### Admin
- [ ] Password-protected `/admin` list of booking requests, newest first, with a status the team can change
- [ ] Only named admin accounts can open it

## Done when

A booking made on the live site, by voice or with the form, appears in
Supabase and in the team's inbox within a minute, and the admin list shows it.
