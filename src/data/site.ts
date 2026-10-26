import type { NavLink } from "@/types/content";

// Site-wide settings: name, contact details and navigation.
// TODO(before launch): replace the placeholder phone number.

export const site = {
  name: "Passionate Taskers",
  shortName: "PT",
  tagline: "Checked local trades, at a price you agree first",
  description:
    "Book a checked local plumber, electrician, gas engineer, painter, carpenter or handyperson in London. ID and DBS checked, insured, with a fixed price before you book.",
  url: "https://passionatetaskers.co.uk",
  area: "London",
  phone: { display: "020 3000 0000", href: "tel:+442030000000" },
  supportHours: "8am to 8pm, 7 days a week",
} as const;

export const mainNav: NavLink[] = [
  { label: "Services", href: "/#services" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Help", href: "/#faq" },
];

export const primaryCta: NavLink = { label: "Book a job", href: "/book" };

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Quick links",
    links: [
      { label: "Services", href: "/#services" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Pricing", href: "/#pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#about" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Trust and safety", href: "/trust" },
      { label: "Accessibility", href: "/accessibility" },
      { label: "Join as a tradesperson", href: "/#about" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "FAQ", href: "/#faq" },
      { label: "Guides", href: "/#guides" },
    ],
  },
];
