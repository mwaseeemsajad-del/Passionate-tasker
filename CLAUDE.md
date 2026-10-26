@AGENTS.md

# Passionate Taskers: working rules

UK marketplace for checked local trades (plumbing, electrical, gas, heating,
painting and decorating, carpentry, handyman). Competitor and UX reference:
TaskRabbit UK. Accessibility for blind, low-vision and elderly users is a
product requirement (WCAG 2.2 AA). MVP launch target: 22 October 2026.

Read first: `.claude/milestones/README.md` (the plan), `.claude/Design.md`
(the design system), `.claude/skills/ui-ux-design/SKILL.md`.
`.claude/SESSION-HANDOVER.md`, `.claude/prompt.md` and the older scripts in
`.claude/tools` describe the earlier project and are background only.

## Building UI

- **Build from `@/components/ui` first.** Button, Section, SectionHeader,
  Container, Card, Badge, IconCircle, CheckList, Stat, Media, Avatar, Rating,
  Accordion, SegmentedToggle. Do not re-create these styles inside a page.
- Need something new and reusable? Add it to `src/components/ui/` and export
  it from `index.ts`, then use it.
- **No hex values in components.** Colours, radii, type sizes and breakpoints
  are tokens in `src/app/globals.css` (`bg-ink`, `text-on-ink-2`, `rounded-xl`,
  `text-h2`, `lg:`). Add a token there if one is missing.
- Icons: `lucide-react` only, `strokeWidth={1.5}`, `aria-hidden` when decorative.
- Motion: use `Reveal`, `RevealGroup`, `RevealItem`, `CountUp` from
  `@/components/motion`. Shared timings live in `src/lib/motion.ts`.
- Server components by default. Add `"use client"` only to the small piece
  that needs state or browser APIs (see `timeline.tsx`, `pricing-plans.tsx`).
- Every section: one `id`, `aria-labelledby` pointing at its heading, one h1
  per page.

## Content

- Content lives in `src/data/*` with types in `src/types/content.ts`.
  Components take typed props, so the backend can replace the data files
  without UI changes.
- **Never claim something that is not true yet.** Figures, reviews and plans
  in `src/data` are samples and are labelled as such on the page.
- UK English, £, en-GB dates.

## Checks before finishing

`npm run lint`, `npm run build` (both must be clean). Check 390px and
1440px widths. Commits only when asked; never push.
