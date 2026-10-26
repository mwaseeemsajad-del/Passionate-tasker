# Passionate Taskers: milestones

Last updated: 2026-10-17. This folder replaces the milestones of the earlier
project (the dark copper site on GitHub). Those are history; these are the plan.

## The goal

**MVP launch on Thursday 22 October 2026** (4 to 5 days from 17 October).

The MVP is a **concierge launch**. A customer books a checked tradesperson
online, by voice or with the form. The request is saved, and our team gets an
email. The team phones the customer, arranges a vetted tradesperson by hand,
and tracks the job in a simple admin list. Accounts, automatic matching and
online payment come after launch.

Trades at launch: plumbing, electrical, gas, heating and boilers, painting and
decorating, carpentry, handyman and mounting.

## Status at a glance

| # | Milestone | Phase | Status | Target |
|---|---|---|---|---|
| 01 | [Frontend](01-frontend.md) | MVP | Done except client photos and logo | Sat 17 Oct |
| 02 | [Accessibility](02-accessibility.md) | MVP | Done except the NVDA test | Sat 17 Oct |
| 03 | [Backend on Supabase](03-backend-supabase.md) | MVP | Built; SQL to run, team email (N2) | Mon 19 to Tue 20 Oct |
| 04 | [MVP launch](04-mvp-launch.md) | MVP | Not started | Wed 21 to Thu 22 Oct |
| 05 | [Accounts](05-accounts.md) | Brought forward | Built 26 Oct: login, sign-up, reset, dashboards | |
| 06 | [Tradesperson onboarding and verification](06-tradesperson-verification.md) | After launch | Not started | |
| 07 | [Marketplace loop](07-marketplace-loop.md) | After launch | Not started | |
| 08 | [Payments and reviews](08-payments-reviews.md) | After launch | Not started | |
| 09 | [Full launch gate](09-full-launch-gate.md) | After launch | Not started | |

## Day by day to the MVP

| Day | Work |
|---|---|
| Sat 17 Oct | Done: design system, landing page, booking form, Book by voice, seven trades, gas emergency safety message |
| Sun 18 Oct | Accessibility settings (larger text, high contrast), accessibility, trust and how-it-works pages, SEO |
| Mon 19 Oct | Supabase: tables, security rules, booking requests and waitlist saved, email to the team |
| Tue 20 Oct | Admin list of requests, "join as a tradesperson" form, privacy, terms and cookie pages |
| Wed 21 Oct | Deploy to Vercel, domain, real content swapped in, full test pass |
| Thu 22 Oct | Launch |

## Decisions and inputs needed

Nothing that depends on one of these is built until it is answered.

| # | Needed | From | Blocks |
|---|---|---|---|
| N1 | ~~Supabase project URL and key~~ Received 26 Oct | Client | 03 |
| N2 | Email address that receives new booking requests | Client | 03 |
| N3 | Domain name, and access to its DNS | Client | 04 |
| N4 | Real phone number and support hours | Client | 04 |
| N5 | Who phones customers and arranges tradespeople during the MVP | Client | 04 |
| N6 | Real starting prices per job, or approval of the current ones as "indicative" | Client | 04 |
| N7 | Real figures and reviews, or approval to remove the sample ones at launch | Client | 04 |
| N8 | Company name, address and contact email for the privacy and terms pages | Client | 04 |

## Rules for every milestone

- **Build from `src/components/ui`.** Do not restyle per page. See `CLAUDE.md`.
- **Accessibility is the product.** Blind, low-vision and elderly users must be
  able to use every screen. WCAG 2.2 AA is the floor.
- **Never claim what is not true.** The sample figures and reviews are fine in
  the prototype, but they must be replaced with real ones or removed before
  the public launch. Fake reviews are illegal in the UK (Digital Markets,
  Competition and Consumers Act 2024).
- **Gas and electrics need the right register.** Gas work only by Gas Safe
  registered engineers; notifiable electrical work only by NICEIC or NAPIT
  members. A gas smell is an emergency: the site sends people to 0800 111 999.
- **No secret reaches the browser.** Server-only keys stay on the server.
- **Checks before any milestone counts as done:** `npm run lint`,
  `npm run build`, and `npm run booking` in `.claude/tools` all pass.
- Git is handled by the client in the new repository.

## Each milestone file has

Status, why it matters, what it depends on, what is done, a checklist, and
when it counts as done. Tick a box only when the work has landed and been
checked.
