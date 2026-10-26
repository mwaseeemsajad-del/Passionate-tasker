import { CreditCard, MessageSquare, ReceiptPoundSterling, RotateCcw, ShieldCheck, UserRound } from "lucide-react";
import { photos } from "./photos";
import type { Faq, Feature, Guide, RecentJob, Review, StatItem, Step } from "@/types/content";

/*
 * SAMPLE DATA for the landing page prototype.
 * Project rule: the site must never claim something that is not true yet.
 * Every number, review and recent job below is a placeholder and must be
 * replaced with real figures, or removed, before launch.
 */

export const heroStat: StatItem = { value: 12400, suffix: "+", label: "Jobs finished this year by tradespeople who passed all four checks." };

export const heroRating = { score: 4.9, count: 2180 };

/** Public registers we check tradespeople against (shown as a marquee, not as partners). */
export const registers = [
  "Gas Safe Register",
  "NICEIC",
  "NAPIT",
  "Disclosure and Barring Service",
  "Companies House",
  "TrustMark",
  "OFTEC",
];

export const aboutStats: StatItem[] = [
  { value: 1500, suffix: "+", label: "Checked tradespeople" },
  { value: 32, label: "London boroughs covered" },
  { value: 98, suffix: "%", label: "Jobs right first time" },
  { display: "7 days", label: "UK support, 8am to 8pm" },
];

export const reasons: Feature[] = [
  { icon: ShieldCheck, title: "Four checks, every year", body: "Photo ID, a DBS check, trade registration and £2m insurance, renewed annually." },
  { icon: ReceiptPoundSterling, title: "A fixed price first", body: "You see the full price before booking. Extra work needs your yes in the app." },
  { icon: RotateCcw, title: "We come back for free", body: "If the fix fails within 30 days, someone returns at no cost to you." },
];

export const steps: Step[] = [
  { icon: MessageSquare, title: "Tell us the job", body: "Type it, pick it from a list, or say it out loud. Add a photo if it helps.", timing: "About 1 minute" },
  { icon: ReceiptPoundSterling, title: "See your fixed price", body: "Labour and standard parts included. No call-out fee, no surprises on the day.", timing: "Straight away" },
  { icon: UserRound, title: "Choose who comes", body: "Up to three checked tradespeople free at your time, with photos, reviews and registrations.", timing: "You pick the slot" },
  { icon: CreditCard, title: "Pay when it's done", body: "Nothing to pay up front. You pay once the job is finished and you've checked it.", timing: "Price agreed first" },
];

export const recentJobs: RecentJob[] = [
  { id: "brixton-sink", trade: "plumbing", title: "Leak under a kitchen sink, Brixton", summary: "Fixed in 40 minutes for £65, the price shown at booking.", photoAlt: "clean kitchen sink after a leak repair", photo: photos.jobSink },
  { id: "lewisham-fusebox", trade: "electrical", title: "New fuse box and certificate, Lewisham", summary: "NICEIC electrician, certificate emailed the same evening.", photoAlt: "circuit breakers in a new fuse box", photo: photos.jobFuseBox },
  { id: "kingston-boiler", trade: "heating", title: "Boiler service before winter, Kingston", summary: "Gas Safe engineer, 45 minutes, included in Home Cover.", photoAlt: "white panel radiator on a wall", photo: photos.jobHeating },
  { id: "croydon-tv", trade: "handyman", title: "65-inch TV on a plaster wall, Croydon", summary: "Wall checked for cables first, cables hidden, £55.", photoAlt: "TV mounted on a white living room wall", photo: photos.jobTv },
];

export const reviews: Review[] = [
  { id: "r1", name: "Margaret A.", job: "Dripping tap", area: "Croydon", quote: "He rang ten minutes before, took his shoes off, and the tap was done in half an hour." },
  { id: "r2", name: "Sam K.", job: "Socket replacement", area: "Lewisham", quote: "I'm blind and booked the whole thing by voice. I knew the price and who was coming before I hung up." },
  { id: "r3", name: "Priya R.", job: "Boiler service", area: "Kingston", quote: "Boiler service at the price on the screen. The Gas Safe certificate was in my inbox that evening." },
  { id: "r4", name: "Tom O.", job: "Landlord, 3 flats", area: "Hackney", quote: "My tenants book repairs themselves now. I just get the invoice and the photos." },
];

export const guides: Guide[] = [
  { slug: "bleed-a-radiator", date: "2026-10-09", title: "How to bleed a radiator before the heating goes on", excerpt: "A five-minute job that fixes cold patches at the top of a radiator.", photoAlt: "white radiator in a room", photo: photos.guideRadiator },
  { slug: "check-gas-safe", date: "2026-09-28", title: "How to check a gas engineer is really registered", excerpt: "Ask for their card and check the number on the Gas Safe Register yourself.", photoAlt: "gas valve with a pressure gauge", photo: photos.guideGas },
  { slug: "find-your-stopcock", date: "2026-09-14", title: "Find your stopcock before you need it", excerpt: "Where it usually is, and how to turn the water off in a burst-pipe emergency.", photoAlt: "water pipe and valve on a wall", photo: photos.guideStopcock },
];

export const ctaChecklist = ["No call-out fee", "Every tradesperson checked", "Book by voice, phone or online"];

export const faqs: Faq[] = [
  { question: "How do you check tradespeople?", answer: "We match photo ID to a live selfie, run a basic DBS check every year, look them up on the register for their trade, and keep their insurance certificate on file." },
  { question: "What if the job costs more than the price shown?", answer: "The tradesperson has to send you the new price in the app, and nothing extra happens until you say yes." },
  { question: "Can I book without using the website?", answer: "Yes. Call us between 8am and 8pm and we will book it for you. Or use Book by voice, which asks one question at a time." },
  { question: "When do I pay?", answer: "Only once the job is finished and you've checked it. Nothing is taken when you book. We tell you how to pay when we call to confirm." },
];
