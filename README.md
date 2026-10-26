# Passionate Taskers

Book checked local tradespeople in London: plumbers, electricians, heating
engineers and handypeople, at a fixed price agreed before anyone arrives.

**Status:** frontend landing page prototype. All figures, reviews and plans are
sample content. No backend yet.

## Stack

- Next.js 16 (App Router, Turbopack, Cache Components) and React 19
- TypeScript
- Tailwind CSS v4, with design tokens in `src/app/globals.css`
- lucide-react for icons
- Motion (`motion/react`) for scroll reveals, counters and the timeline
- Figtree font through `next/font`

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build    # production build
```

## Project structure

```
src/
  app/
    layout.tsx              root: font, metadata, skip link, motion settings
    globals.css             design tokens (@theme) and base styles
    not-found.tsx
    (marketing)/            public pages: navbar + footer layout
      page.tsx              home page, composed from landing sections
  components/
    ui/                     design system primitives (Button, Section, Card ...)
    layout/                 Navbar, MobileMenu, Footer, Logo
    motion/                 Reveal, CountUp, MotionProvider
  features/
    landing/
      sections/             one file per home page section
      components/           pieces only the landing page uses
  data/                     typed sample content (swap for the database later)
  types/                    content types shared by data and components
  lib/                      cn() class helper, shared motion variants
```

### Rules

1. **Pages compose, features own, `ui` is shared.** A route file only arranges
   sections. A section belongs to a feature. Anything two features need moves
   down to `components/ui`.
2. **Tokens, not hex.** Every colour, radius and size comes from
   `globals.css`.
3. **Server first.** Only interactive leaves are client components.
4. **Data behind types.** Only sections and layout components read from
   `src/data`; everything below them takes typed props, so a database or API
   can replace `src/data` later.

### Where future work goes

| Area | Route group | Feature folder |
|---|---|---|
| Service and category pages | `(marketing)/services/[trade]` | `features/services` |
| Booking flow | `(marketing)/book/[trade]` | `features/booking` |
| Customer account | `(account)/` | `features/account` |
| Tradesperson dashboard | `(pro)/` | `features/pro` |
| Server logic and data access | `app/api`, server actions | `src/server` |

## Design

The design system is documented in `.claude/Design.md`. Photos are
placeholders: pass `src` to `<Media>` (or the hero background) when real
photography is ready.
