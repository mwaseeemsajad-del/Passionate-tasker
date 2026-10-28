# 02: Accessibility

**Status:** MVP part done except the NVDA test (17 October 2026)
**Phase:** MVP
**Depends on:** 01
**Why it matters:** accessibility for blind, low-vision and elderly people is
why this product exists, and the thing TaskRabbit does not do well.

## Done so far

- [x] Book by voice (see 01)
- [x] Skip link, labelled controls, visible focus rings (ink on light, green on dark)
- [x] Reduced motion respected: movement removed, fades kept, marquee stops
- [x] axe scan clean on the home page and every booking screen
- [x] Error summary takes focus and links to each field; errors say how to fix them
- [x] Body text 18px, targets at least 44px
- [x] Display settings in the header of every page ("Display"), and on /accessibility: larger text (125%) and high contrast, remembered on the device, applied before the first paint, high contrast on by default when the device asks for more contrast
- [x] All font sizes in rem, so larger text scales everything
- [x] /accessibility: what works, the standard, how we test, eight known limitations, how to tell us
- [x] /trust: identity, basic DBS, insurance, Gas Safe, electrical scheme checks; what to do on the day; gas emergency; problems
- [x] /how-it-works: the four steps of the concierge MVP, in honest words
- [x] robots.txt and sitemap.xml (booking left out and set to noindex)
- [x] Landing page no longer promises "your card is held": there is no online payment in the MVP
- [x] 27 Oct 2026: axe (WCAG 2.2 AA + best practice), one h1, no skipped headings and labelled sections on all 24 public pages (login, sign-up, services and every trade page included) in all four display settings: clean. Keyboard walk on the newer pages: clean. 200% and 400% zoom (640px and 320px): no sideways scroll
- [x] Dashboards: two-press confirms ("Cancel request", "Approve") now move focus to "Yes" and back, and read the question out; accepting, declining, finishing or cancelling a job is announced site-wide (`announce()` in `src/lib/announce.ts`), because the card moves and takes its own live region with it
- [x] Checks in .claude/tools: `npm run display` (43 checks: settings, axe on 5 pages in 4 settings, headings, no sideways scroll at 6 widths with and without larger text) and `npm run keys` (keyboard walk: focus ring on every stop, targets 24px or more)

## Checklist

### Before the MVP launch
- [x] Display settings: larger text and high contrast, remembered between visits, also on when the device asks for more contrast
- [x] `/accessibility` page: what works, the standard we aim for, how we test, known limitations, how to contact us
- [x] `/trust` page: exactly what is checked for each tradesperson, in plain words
- [x] `/how-it-works` page
- [x] Keyboard-only walk through every public page (automated: `npm run keys`)
- [x] No sideways scrolling at 320px wide, which is what 400% zoom at 1280px gives (automated: `npm run display`)
- [ ] Browser zoom at 200% and 400% checked by eye on a real screen (simulated at 640px and 320px on 27 Oct: reflows cleanly)
- [ ] Dashboards (account, provider, admin) audited in the browser: needs a test login for each role
- [ ] **Needs a person:** NVDA with Chrome on Windows, complete one booking with the form and one by voice
- [ ] **Needs the client:** a contact email for the accessibility page (it offers the phone number for now)

### After the MVP launch
- [x] Help assistant for low-vision users (27 Oct 2026, brought forward): "Help" in the bottom-right corner of every public page (`help-assistant.tsx`, answers in `src/data/assistant.ts`). Scripted, no AI, at the client's choice. A spoken conversation: it asks what the visitor needs, listens after the beep, and does it: books (hands over to the voice booking on /book with the trade chosen, `?voice=start&trade=…`), answers prices (per trade), checks and contact, turns on larger text or high contrast, opens pages, then asks "Anything else?". Words it understands: `src/features/assistant/understand.ts`. Opens small by itself once per visit without taking focus (not on /book), starts talking on the first click or key press (browsers block speech before one), stays open from page to page until Close, Escape or "goodbye", stops after two silences. "Fix my leaking tap" picks the trade and the job. During the voice booking the panel follows it (step, question, what was heard, Stop, Carry on) through `src/lib/voice-session.ts`, and the field being asked is marked with a dashed outline (`data-voice-asking`) and scrolled into view. Stop, Escape and Close; "Talk to me" switch turns voice off. axe clean open and closed; conversation checked with a fake microphone (17 checks)
- [ ] Help assistant: try with NVDA, to hear whether the spoken greeting clashes with the screen reader; if it does, turn the greeting off when the first key pressed is a screen reader one
- [ ] VoiceOver on iPhone and Mac
- [ ] First use by at least one elderly person and one blind or low-vision person who have never seen the site; fix what they hit

## Done when

The MVP items above are ticked, and the accessibility page states honestly
what is not yet tested.
