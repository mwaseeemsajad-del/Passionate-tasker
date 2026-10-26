import type { LucideIcon } from "lucide-react";

/*
 * Shapes of the content the site shows. Today they are filled from the mock
 * files in src/data; later the same shapes come from the database, so the
 * components do not change when the backend arrives.
 */

export type NavLink = { label: string; href: string };

export type Trade = "plumbing" | "electrical" | "gas" | "heating" | "painting" | "carpentry" | "handyman";

export type ServiceJob = {
  slug: string;
  name: string;
  /** Starting price in whole pounds; null when it can only be quoted. */
  fromPrice: number | null;
};

export type Service = {
  slug: Trade;
  name: string;
  /** How a person names the tradesperson: "a plumber". */
  person: string;
  jobs: ServiceJob[];
  summary: string;
  /** Starting price in whole pounds. */
  fromPrice: number;
  priceUnit?: "job" | "hour";
  /** The registration the law or we require for this trade, if any. */
  registration?: string;
  highlight: string;
  /** Safety message shown and spoken as soon as this trade is chosen. */
  notice?: string;
  photoAlt: string;
  photo?: string;
};

export type Feature = { icon: LucideIcon; title: string; body: string };

export type Step = { icon: LucideIcon; title: string; body: string; timing: string };

export type StatItem = { label: string; value?: number; suffix?: string; display?: string };

export type BillingPeriod = "monthly" | "yearly";

export type Plan = {
  id: string;
  name: string;
  /** Price in whole pounds per period. */
  price: Record<BillingPeriod, number>;
  ctaLabel: string;
  featuresIntro: string;
  features: string[];
  featured?: boolean;
};

export type RecentJob = { id: string; title: string; summary: string; trade: Trade; photoAlt: string; photo?: string };

export type Review = { id: string; name: string; job: string; area: string; quote: string };

export type Guide = { slug: string; title: string; excerpt: string; date: string; photoAlt: string; photo?: string };

export type Faq = { question: string; answer: string };
