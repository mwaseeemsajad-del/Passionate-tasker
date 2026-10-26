# DESIGN.md: Design System and Build Guide

> Reference for Claude Code. Based on a study of the "Aquora" Webflow template (a plumbing-services landing page).
> This file captures the design language only: tokens, components, layout rhythm, and motion. It does not copy content, copy text, or images. Replace all copy and imagery with your own brand and niche.
> Items marked **(approx.)** were inferred by eye from the live site, because Webflow's scroll animations are not exposed as readable CSS. Treat them as tuned starting values.

---

## 0. Design Philosophy (read first)

The template has a calm, trustworthy, "premium service business" feel. Five ideas carry it:

1. **Near-black + white + one vivid green accent.** Neutrals do about 90% of the work. Green appears only on small things: icons, the timeline, arrow glyphs, hover states, and tints.
2. **Pill-shaped everything interactive.** Buttons, nav, tabs, and badges are fully rounded. Content containers use large soft radii (16–24px).
3. **Big, tight, semi-bold headings** (Figtree 600, slight negative letter-spacing) over light, airy, generously spaced sections.
4. **Alternating light/dark bands.** Dark sections have big rounded corners, so they read like floating slabs.
5. **Subtle scroll-reveal motion.** Elements fade up, cards stagger in, and a progress line fills as you scroll. Nothing is flashy.

---

## 1. Tech Stack and Project Setup

Recommended (matches Munib's stack):

- **Next.js (App Router) + TypeScript**
- **Tailwind CSS v4** (tokens defined in `@theme`, see section 2)
- **Framer Motion** (`motion/react`) for scroll-reveal, stagger, and the sticky timeline
- **Figtree** via `next/font/google` (weights 300–700)
- **lucide-react** for icons (thin 1.5px stroke style matches the template)
- Optional: **Embla Carousel** for the horizontal projects slider and **Radix Accordion** for the FAQ

```bash
npx create-next-app@latest my-site --ts --tailwind --app --src-dir
cd my-site
npm i motion lucide-react @radix-ui/react-accordion embla-carousel-react
```

Suggested structure:

```
src/
  app/
    layout.tsx          # font + global bg/text
    page.tsx            # composes sections in order (section 6)
    globals.css         # @theme tokens + base styles
  components/
    ui/                 # Button, Badge, Card, SectionHeader, Accordion, Toggle
    layout/             # Navbar, Footer
    sections/           # Hero, Logos, About, WhyChoose, HowItWorks, Services, Pricing, Projects, Testimonials, Blog, CTA, FAQ
  lib/motion.ts         # shared animation variants (section 5)
```

Rules for Claude Code:
- Build **tokens first**, then **UI primitives** (Button, Card, SectionHeader), then **sections**, then **motion**. Do not hard-code hex values in components.
- One reusable `<SectionHeader eyebrow title subtitle align />` handles every section intro.
- Every section is wrapped in a `<Section tone="light|dark">` component that handles padding, background, and radius.

---

## 2. Design Tokens

### 2.1 Colors

| Role | Token | Value |
|---|---|---|
| Ink (text, dark bg, primary button) | `--color-ink` | `#0f110f` |
| Paper (page bg) | `--color-paper` | `#ffffff` |
| Accent vivid (the brand green) | `--color-accent` | `#02cd31` |
| Accent tint bg (light cards, hovers) | `--color-accent-50` | `#f0fcf3` |
| Accent tint fill (badges, icon circles, filled secondary buttons) | `--color-accent-100` | `#d0f2d9` |
| Accent stroke on light | `--color-accent-stroke` | `#bde4c8` |
| Hairline border on light | `--color-line` | `#e5ebe7` |
| Dark surface (cards on dark sections) | `--color-ink-surface` | `#1a1c1a` |
| Dark hairline | `--color-ink-line` | `#262a27` |
| Body text secondary (on light) | `--color-text-2` | `#353635` |
| Body text muted | `--color-text-3` | `#606060` |
| Body text tertiary / placeholders | `--color-text-4` | `#8c8c8c` |
| Text secondary on dark | `--color-on-ink-2` | `#dae1dc` |
| Text tertiary on dark | `--color-on-ink-3` | `#7d857f` |

Usage rules:
- Page text = `ink`. Paragraphs are `ink` or `text-2`. Never pure `#000`.
- On dark sections, headings are `#fff` and paragraphs are `on-ink-2`.
- The green is an **accent, never a section background**. Light green tints (`accent-50/100`) are used for cards, badges, and the "filled" secondary button.
- The hero text sits over a photo with a dark gradient overlay (see 6.1).

### 2.2 Typography

**Font:** `Figtree` (Google Fonts), fallback `sans-serif`. One family for everything.

| Style | Size | Line-height | Weight | Letter-spacing |
|---|---|---|---|---|
| H1 (hero) | 64px | ~1.09 | 600 | -0.01em |
| H2 (section) | 40px (the base CSS token says 56px, but section titles on the home page render at 40px; use 40px) | ~1.2 | 600 | -0.01em |
| H3 (card title) | 24px | ~1.33 | 600 | -0.01em |
| H4 (blog card title) | 20px | ~1.4 | 600 | -0.01em |
| Body regular | 18px | normal / 1.5 | 400 | -0.01em |
| Body small (buttons, nav) | 16px | 1.25–1.5 | 400–500 | -0.01em |
| Eyebrow label | 14–16px | 1.4 | 400 | normal |

Responsive scale (Webflow breakpoints 991 / 767 / 479): scale H1 roughly 64 → 52 → 44 → 38, and H2 40 → 36 → 32 → 28. Use `clamp()`.

**Eyebrow pattern:** a short label with a leading slash, such as `/About us` or `/Pricing Plan`. It sits above every section title, small and regular weight, in ink (or white on dark). Keep this signature detail.

### 2.3 Radius

| Token | Value | Used for |
|---|---|---|
| `r-sm` | 8px | small chips |
| `r-md` | 12px | inputs, small cards |
| `r-lg` | 16px | cards, pricing cards, images |
| `r-xl` | 24px | large cards, image frames, FAQ container |
| `r-pill` | 40px+ / 9999px | **buttons, nav bar, toggle, badges** |
| `r-section` | ~48–80px | rounded corners on dark section slabs |

### 2.4 Spacing (4/8 scale)

Available steps: 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 60, 64, 72, 80, 100, 120, 140, 160.

- **Container:** max-width `1200px`, side padding `48px` (drop to 24px on tablet and 16px on mobile), centered.
- **Section vertical padding:** `124px` top/bottom on desktop (`80px` for denser sections like logos and the dark How-it-Works), `~72px` on tablet, `~56px` on mobile.
- **Gap between section header and content:** 48–64px.
- **Card padding:** 24px. **Card gaps:** 24–32px.

### 2.5 Shadows and borders

The design is almost **flat**. It uses 1px hairline borders (`--color-line`) instead of shadows. Hero floating cards use a frosted glass look (blur plus a translucent white fill, see 6.1). Avoid heavy drop shadows.

### 2.6 Tailwind v4 `@theme` starter

```css
@import "tailwindcss";

@theme {
  --font-sans: var(--font-figtree), sans-serif;

  --color-ink: #0f110f;
  --color-paper: #ffffff;
  --color-accent: #02cd31;
  --color-accent-50: #f0fcf3;
  --color-accent-100: #d0f2d9;
  --color-accent-stroke: #bde4c8;
  --color-line: #e5ebe7;
  --color-ink-surface: #1a1c1a;
  --color-ink-line: #262a27;
  --color-text-2: #353635;
  --color-text-3: #606060;
  --color-text-4: #8c8c8c;
  --color-on-ink-2: #dae1dc;
  --color-on-ink-3: #7d857f;

  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-pill: 9999px;

  --container: 1200px;
}

body { font-family: var(--font-sans); font-size: 18px; color: var(--color-ink); background: var(--color-paper); letter-spacing: -0.01em; }
h1,h2,h3,h4 { font-weight: 600; letter-spacing: -0.01em; }
```

---

## 3. Navigation Bar

- **Shape:** a floating **white pill** (fully rounded) centered at the top, with a small gap from the viewport edge. It sits over the hero image, so the hero must extend underneath it.
- **Layout (left to right):** the logo (green rounded-square mark plus wordmark) sits on the left, outside the pill. Inside the pill are the nav links (Services, Projects, Pricing, and a dropdown "All Page ▾"), then the **black arrow button** (see 4.1) at the right end.
- **Links:** 16px, ink, regular weight, with a `color 0.2s` hover transition. The dropdown opens a small white rounded panel.
- **Vertical padding:** ~16px. The header background is transparent, and only the pill is white.
- **Mobile:** collapse to a hamburger. The pill becomes a full-width rounded bar, and the menu opens as a stacked list.

---

## 4. Buttons (the signature component)

All buttons are **pills with a circular arrow badge**. Two variants only, plus the filled-tint pricing button.

### 4.1 Primary: "Arrow Black" (on light backgrounds)

- Background `ink` (`#0f110f`), text white, radius pill (40px).
- Padding: **4px 4px 4px 16px** (asymmetric: the arrow circle hugs the right edge).
- Layout: flex, `align-items: center`, gap 16px.
- Text: 16–18px, weight 400–500.
- Right side: a **36×36px white circle** with a thin right arrow (→) in ink or green.
- Overall height ≈ 44px.

### 4.2 Secondary: "Arrow White" (on dark backgrounds, or over photos)

- Background white, text ink, same pill shape and padding as 4.1.
- Wrapped in an outer element with `padding: 1px` and `overflow: hidden`, which acts as a hairline border or glow ring.
- The arrow circle is **ink/black with a green arrow** (inverse of the primary).
- Total height ≈ 46px (44px plus the 1px ring).

### 4.3 Hover animation (both variants)

The text is built as **two stacked copies** of the label inside a clipped wrapper (`overflow: hidden`, height of one line). On hover, both lines translate up by 100% of one line, so a second copy of the same label rolls into view (a "text roll"). Simultaneously, the arrow slides out to the right while a copy slides in from the left, or it nudges ~4px right. **(approx.)**

```tsx
// Button.tsx (sketch)
<a className="group inline-flex items-center gap-4 rounded-full bg-ink py-1 pr-1 pl-4 text-white">
  <span className="relative block h-[1.5em] overflow-hidden">
    <span className="block transition-transform duration-300 ease-out group-hover:-translate-y-full">{label}</span>
    <span className="absolute left-0 top-full block transition-transform duration-300 ease-out group-hover:-translate-y-full">{label}</span>
  </span>
  <span className="grid size-9 place-items-center rounded-full bg-white text-ink overflow-hidden">
    <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
  </span>
</a>
```

Timing: `transition: all 0.3s` (the site uses 0.2–0.4s throughout). Easing: `ease-out` or `cubic-bezier(.22,1,.36,1)`.

### 4.4 Pricing / form buttons

- **Filled tint button** (inside a light pricing card): background `accent-100`, text ink, full-width, pill, 16px, no arrow. Hover: darken slightly or fill with `accent`.
- **White full-width button** (inside the highlighted dark pricing card): white bg, ink text, pill.
- **Submit / footer mail button hover:** background switches to `accent`, text to white. The form submit goes white with a green border and green text.

### 4.5 Button usage rules

- One primary CTA per section (hero, about, how-it-works, CTA band, each service row and project card).
- Use **4.1 on white** sections and **4.2 on dark** sections or over images.
- Never use rectangular or low-radius buttons.

---

## 5. Motion and Animation Language

The template uses Webflow Interactions. Re-create the same feel with Framer Motion:

| Interaction | Behavior | Spec (approx.) |
|---|---|---|
| **Scroll reveal (default)** | Elements start `opacity: 0`, `y: 24–40px`, then fade up as they enter the viewport. | duration 0.6–0.8s, ease-out, trigger once at ~20% in view |
| **Stagger** | Grouped cards (why-choose items, pricing cards, testimonials) enter one after another. | 0.1–0.15s between children |
| **Image reveal** | Images fade in with a slight scale from ~0.96 to 1 and sometimes a mask or parallax. | 0.8s |
| **Counters** | Hero and about stats ("50K+", "15+", "1500+", "98%+", "24/7") count up from 0 when visible. | 1.5–2s, ease-out, trigger once |
| **Logo marquee** | Client logos sit in a light green rounded chip row that scrolls horizontally in a continuous loop. | linear, 20–30s loop, pause on hover optional |
| **Sticky timeline (How it Works)** | Left column (title, text, button) is **sticky** while the right column scrolls. A thin vertical line with a green dot fills green from top to bottom, tied to scroll progress. Each step card fades and slides in as the line reaches it. | use `useScroll` + `useTransform` for the line's `scaleY` or height |
| **Projects slider** | Wide image cards (nearly full container width) in a horizontal carousel, with the next card peeking in from the right edge. | drag or arrow nav |
| **Pricing toggle** | The Monthly/Yearly pill toggle slides a black pill indicator behind the active label. Prices swap with a quick fade or number tick. | 0.3s |
| **FAQ accordion** | Click a row to expand it. The chevron sits in a small light-green circle and rotates. The content height animates. | 0.3–0.4s |
| **Hover on nav links** | Color shift only. | 0.2s |

Shared variants (`lib/motion.ts`):

```ts
export const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};
export const stagger = { show: { transition: { staggerChildren: 0.12 } } };
// usage: <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} />
```

Always respect `prefers-reduced-motion` (disable translate and scale, keep fades).

---

## 6. Page Layout, Section by Section

Order on the home page, top to bottom. Each section's job is described generically, so reuse the structure with your own content.

### 6.1 Hero (full-bleed image)
- Section is full width with a large rounded bottom (~40–60px radius), and `overflow: hidden`. The navbar overlays it.
- **Background:** a full-bleed photo with a dark gradient overlay (darker on the left, where the text is) so white text stays readable.
- **Left block:** H1 (64px, white, 3 lines max) and a short 18px white paragraph (~2 lines). Below it sit the white **Arrow White button** and a rating row (five stars plus a small "reviews" label).
- **Bottom-right floating card (frosted glass):** a translucent white fill with `backdrop-filter: blur(~16px)`, a thin light border, and radius ~24px. It contains a large stat (for example "50K+" in ~48px white), a short caption, a small stack of overlapping circular avatars, and a small white pill button.
- Bottom padding below the hero content is ~72px.

### 6.2 Trusted-by / logos strip
- Light section. A small centered line of text ("We work with more than 500+ companies"), then a marquee of logos, each in a pale green rounded chip (`accent-50`, pill-ish radius).

### 6.3 About
- Two columns. **Left:** eyebrow, H2 (40px, 3 lines), a paragraph, then a primary black button. **Right:** one rounded image (radius 16–24px, portrait-ish ratio).
- Below, separated by a hairline, a **4-up stat row**: a big number with a "+" or "%" suffix (about 48px, 600 weight) and a small label beneath. A thin vertical divider can separate the items.

### 6.4 Why Choose Us
- Two columns, mirrored from About. **Left:** eyebrow, H2, paragraph, then a stack of **3 feature cards**. **Right:** a tall portrait image (radius 16–24px).
- Feature card: radius 16px, a 1px `line` border, an optional very light tint background, padding 24px, a thin-line icon on top (24px), an H3 (24px), and a 2-line muted paragraph. Cards stagger in.
- Bottom of the section: a primary black button.

### 6.5 How It Works (dark slab)
- Background `ink`, with **large rounded top and bottom corners** (~48–80px) so it looks like a floating black card. Padding 80px.
- Left column is **sticky**: eyebrow, white H2, a paragraph, and the white arrow button.
- Right column: a vertical **timeline**. A thin line sits with a green dot at the top, and the line fills green as you scroll. Next to it are 3 step cards, each with `ink-surface` background, a `ink-line` 1px border, radius ~16px, a **green** icon, a white H3, and a muted paragraph in `on-ink-2`.
- Steps are numbered implicitly. Cards fade and slide in as the line reaches them.

### 6.6 Services
- Light section. **Centered** header (eyebrow, H2, subtitle).
- Then a vertical list of service rows. Each row is two columns: on one side the text (H3 24px, a muted paragraph, and a black pill button); on the other a **wide image** (radius ~16px, ~16:9). Rows alternate or stack with ~48px gaps. Each row reveals as it enters the viewport.

### 6.7 Pricing
- Light section. Centered header, then a **Monthly / Yearly toggle**: a small white pill with a hairline border, and the active option is a black pill with white text.
- **3 cards** in a row, equal width, with the middle card highlighted:
  - Standard cards: `accent-50` bg, 1px `line` border, radius 16–24px, padding 24px. They show a plan name (small), a price (a small `$` superscript, a large number ~48px, and a small "USD / Per project" label), a full-width **filled-tint button**, then an "Available features:" muted label, and a list with check-in-circle icons (outlined, thin).
  - **Featured card:** `ink` background, white text, a small white "Most Popular" pill badge top-right, a white full-width button, and white check icons. It is slightly raised (offset up) or visually larger.

### 6.8 Projects (dark slab)
- Dark section with the same rounded-slab treatment as 6.5, padding 124px. Centered white header.
- A horizontal carousel of **big image cards** (radius ~24px, almost full container width, ~16:9). On each card, a dark bottom gradient overlay holds a large white H3 (about 36px, bottom-left) and, to its right, a short paragraph plus a white arrow button. The next card peeks in at the right edge.

### 6.9 Testimonials
- Light section, centered header. A **3-column masonry-style grid** that alternates text cards and photo cards, with a staggered vertical offset.
- **Text card:** `accent-50` bg, radius 16px, padding ~20px. Contains a small round avatar, a name (600) with a role underneath (muted, small), and a quote paragraph (~15–16px).
- **Photo card:** a portrait image with radius 16px and a soft tinted background.

### 6.10 Blog
- Light section, centered header. A 3-column grid of blog cards: a rounded image on top, then a date (small, muted), an H4 (20px, 600, 2 lines), and a muted excerpt. Hover: image zooms very slightly and the title shifts toward the accent. **(approx.)**

### 6.11 CTA band (dark slab)
- Dark slab like 6.5 (radius corners, 124px padding). Two columns. **Left:** white H2, a short paragraph, the white arrow button, and a **checklist of 3 items** (green circle-check icons plus white text). **Right:** one rounded image (radius 16–24px).

### 6.12 FAQ
- Light section, centered header. A single container (~720px max width): white, 1px `line` border, radius ~24px, padding ~24–32px.
- Rows are separated by hairlines. Each row has the question on the left (~18px) and a **small circular chevron badge** on the right (32×32px, `accent-100` fill, a green or dark chevron that rotates when open).

### 6.13 Footer
- Dark (`ink`) background, full width, with no large rounded corners (or only slight ones). A "Quick link" column with muted-white links, and a hairline divider above a bottom bar. The bottom bar has a copyright line on the left (with an underlined credit link) and a credits line on the right. Link hover: brighten to white, or shift to the accent.

---

## 7. Content Primitives

- **Section header:** eyebrow (`/Label`), H2, then an 18px muted subtitle, ~480–560px max width. Centered in Services, Pricing, Projects, Testimonials, Blog, and FAQ. Left-aligned in the two-column sections.
- **Check list item:** a 20px outlined circle-check icon (thin stroke) plus 16–18px text, with ~12–16px gap between rows.
- **Stat:** a number at 48–56px weight 600, and a small muted label.
- **Badge ("Most Popular"):** a white pill, small text, muted ink, ~4px 12px padding.
- **Icon circles:** 32–40px circles filled with `accent-100`, holding a thin-line icon in ink or green.

---

## 8. Responsive Behavior

Breakpoints: **≥1280** wide desktop, **≤991** tablet, **≤767** large mobile, **≤479** small mobile.

- Two-column sections stack to one column below 991px (image goes below or above text, consistently).
- Pricing cards stack to a single column, with the featured card first or in its natural order. Testimonial grid goes to 2 columns, then 1.
- Container padding: 48 → 32 → 24 → 16px.
- Section vertical padding: 124 → 96 → 72 → 56px.
- The sticky timeline becomes a normal (non-sticky) block on tablet and mobile.
- The nav collapses to a hamburger below 991px. Hero stat card moves below the hero text and stays full-width.

---

## 9. Accessibility and Quality Checklist

- Text contrast: keep white text on the hero over a sufficiently dark overlay. Muted greys (`#8c8c8c`) are for decorative or tertiary text only.
- All interactive elements need visible `:focus-visible` styles (a 2px `accent` ring with 2px offset).
- The FAQ accordion, pricing toggle, and carousel need proper ARIA roles and keyboard support (Radix handles accordion and toggle).
- Images use `next/image`, with explicit sizes and `alt` text.
- Honor `prefers-reduced-motion`.
- Check Lighthouse performance. Lazy-load below-the-fold images, and keep the hero image optimized (AVIF/WebP).

---

## 10. Build Order for Claude Code

1. Scaffold the project and add tokens (section 2.6) and the Figtree font.
2. Build `Button` (both variants plus hover roll), `SectionHeader`, `Section` (light/dark with radius), `Card`, and `Badge`.
3. Build `Navbar` and `Footer`.
4. Build sections in the order of section 6, using placeholder copy and placeholder images.
5. Add motion (section 5): reveal and stagger first, then counters, marquee, the sticky timeline, the pricing toggle, and the FAQ accordion.
6. Add the responsive pass (section 8), then the accessibility pass (section 9).
7. Replace placeholders with the real brand colors, copy, and photos.

---

## 11. Making It Your Own (so it is not a copy)

This file describes structure and feel. To keep your site original:
- Change the **accent color** (swap `#02cd31` for your own brand hue and regenerate the three tints).
- Change the **font** if you want a different personality (the layout works with any clean geometric sans).
- Use your own **copy, imagery, icons, and logo**.
- Change the **section order** or **swap layouts** (for example, make Services a card grid instead of alternating rows).
- Keep the parts that make the experience feel good: pill buttons with the arrow badge and text roll, the dark rounded slabs, the `/Eyebrow` labels, and the gentle scroll reveals.

---

## 12. Open Questions for Munib

Answer these and this file can be tightened:
1. What is **your** niche or brand for this template (agency, SaaS, a service business)? The section list in 6 can be adapted to fit.
2. Do you want to **keep the green accent**, or use a brand color of your own?
3. Do you want the Webflow-style **sticky timeline** and **marquee**, or a simpler static version first?