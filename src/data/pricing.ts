import type { Plan } from "@/types/content";

// SAMPLE DATA. The plans are a proposal for the prototype, not decided products.

export const plans: Plan[] = [
  {
    id: "pay-as-you-go",
    name: "Pay as you go",
    price: { monthly: 0, yearly: 0 },
    ctaLabel: "Book a single job",
    featuresIntro: "What's included:",
    features: ["Fixed price per job", "30-day work guarantee", "Book by voice or phone"],
  },
  {
    id: "home-cover",
    name: "Home Cover",
    price: { monthly: 12, yearly: 120 },
    ctaLabel: "Start Home Cover",
    featuresIntro: "Everything in Pay as you go, plus:",
    features: ["Annual boiler service included", "10% off every job", "Priority same-day slots", "A named support contact"],
    featured: true,
  },
  {
    id: "landlord",
    name: "Landlord",
    price: { monthly: 29, yearly: 290 },
    ctaLabel: "Cover your properties",
    featuresIntro: "For up to 5 properties:",
    features: ["Gas safety certificate each year", "Tenants book repairs directly", "Certificates stored in one place"],
  },
];
