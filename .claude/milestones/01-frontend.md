# 01: Frontend

**Status:** Mostly done (17 October 2026)
**Phase:** MVP
**Depends on:** nothing
**Why it matters:** this is what the client approved and what customers see first.

## Done so far

- [x] Next.js 16, TypeScript, Tailwind CSS v4, lucide-react, motion
- [x] Design system from `.claude/Design.md`: tokens in `globals.css`, 19 components in `src/components/ui`
- [x] Landing page: hero, registers strip, about, why choose us, how it works, services, pricing, recent jobs, testimonials, guides, call to action, FAQ, footer
- [x] Seven trades with their jobs and starting prices in `src/data/services.ts`
- [x] Placeholder photography from Unsplash, resized by Unsplash's own CDN
- [x] Booking page `/book`: four steps (the job, when, your details, check and send), error summary, focus moves to each step, answers kept on reload
- [x] Book by voice: one question at a time, every answer read back, postcode, phone and email spelt out, stop, go back and repeat, Escape stops it
- [x] Gas safety: choosing Gas, or saying "I can smell gas", gives the National Gas Emergency number instead of a booking
- [x] Every "Book" button goes to `/book`, with the trade already chosen where it is known
- [x] End-to-end check: `npm run booking` in `.claude/tools` (30 checks, including axe on every booking screen)

## Checklist

- [ ] Popular job links in the hero ("Dripping tap", "Mount a TV") straight into booking with the job chosen
- [ ] One page per trade at `/services/[trade]`, reusing `ServiceRow` and the job list
- [ ] Empty, loading and error states for the booking form when the server is unreachable
- [ ] Replace Unsplash photos with the client's own photos (needs N7 in the README)
- [ ] Logo: the "PT" mark is a placeholder

## Done when

Every public page is built from the shared components, works from 320px to
1920px wide, and passes lint, build and the booking check.
