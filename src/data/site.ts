import type { NavLink } from "@/types/content";

// Site-wide settings: name, contact details and navigation.
// TODO(before launch): replace the placeholder phone number.

export const site = {
  name: "Passionate Taskers",
  shortName: "PT",
  tagline: "Checked local trades, at a price you agree first",
  description:
    "Book a checked local plumber, electrician, gas engineer, painter, carpenter or handyperson in London. ID and DBS checked and insured, with the price agreed before anything is booked.",
  url: "https://passionatetaskers.co.uk",
  area: "London",
  phone: { display: "020 3000 0000", href: "tel:+442030000000" },
  supportHours: "8am to 8pm, 7 days a week",
  // TODO(before launch, input N8): the registered company name, address and contact email.
  legal: { company: "Passionate Taskers", address: "Address to be confirmed", email: "Email to be confirmed", updated: "26 October 2026" },
} as const;

export const mainNav: NavLink[] = [
  { label: "Services", href: "/services" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Help", href: "/help" },
];

export const primaryCta: NavLink = { label: "Book a job", href: "/book" };

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Quick links",
    links: [
      { label: "Services", href: "/services" },
      { label: "Pricing", href: "/pricing" },
      { label: "Help", href: "/help" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Trust and safety", href: "/trust" },
      { label: "Accessibility", href: "/accessibility" },
      { label: "Join as a tradesperson", href: "/join" },
      { label: "Log in", href: "/login" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "FAQ", href: "/help" },
      { label: "Guides", href: "/#guides" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];
