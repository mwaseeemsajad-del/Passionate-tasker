# 01: Frontend

**Status:** Done except the client photos and logo (26 October 2026)
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
- [x] Book by voice: one question at a time, every answer read back, postcode, phone and email spelt out, go back and repeat, Escape stops it
- [x] Saying "stop" (or three silences) pauses instead of ending; it keeps listening quietly and "carry on" resumes with no button press. "Turn off", Escape or the Stop button end it. Pause gives up after 5 minutes (26 Oct)
- [x] Gas safety: choosing Gas, or saying "I can smell gas", gives the National Gas Emergency number instead of a booking
- [x] Every "Book" button goes to `/book`, with the trade already chosen where it is known
- [x] End-to-end check: `npm run booking` in `.claude/tools` (30 checks, including axe on every booking screen)

## Checklist

- [x] Popular job links in the hero ("Dripping tap", "Mount a TV") straight into booking with the job chosen (26 Oct)
- [x] One page per trade at `/services/[trade]` (hero, jobs that open booking with the job chosen, how it works, checks, other trades), plus `/services` (26 Oct)
- [x] Loading, offline and server-unreachable states for the booking form; answers kept, phone number offered (26 Oct)
- [ ] Replace Unsplash photos with the client's own photos (needs N7 in the README)
- [ ] Logo: the "PT" mark is a placeholder

## Done when

Every public page is built from the shared components, works from 320px to
1920px wide, and passes lint, build and the booking check.
