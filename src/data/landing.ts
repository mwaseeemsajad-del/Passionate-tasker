import { CreditCard, MessageSquare, Mic, PhoneCall, ReceiptPoundSterling, ShieldCheck, UserRound } from "lucide-react";
import { photos } from "./photos";
import type { Faq, Feature, Guide, RecentJob, Review, StatItem, Step, Trade } from "@/types/content";

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

// Written for the concierge MVP: a person calls to agree the price and arranges
// who comes. There is no app, no instant price and no choosing a tradesperson
// yet. Update these when matching and payments arrive (milestones 07 and 08).
// A free return visit is not offered until the client confirms it.
export const reasons: Feature[] = [
  { icon: ShieldCheck, title: "Checked, every year", body: "Photo ID, a basic DBS check, insurance, and the right register for gas and electrics. Checked again every year." },
  { icon: ReceiptPoundSterling, title: "Price agreed first", body: "We agree the price with you on the phone before anything is booked. Extra work needs your yes first." },
  { icon: Mic, title: "Book the way that suits you", body: "Talk to Book by voice, fill in a short form, or call us. Every answer is read back to you." },
];

export const steps: Step[] = [
  { icon: MessageSquare, title: "Tell us the job", body: "Pick it from a list, type it, or say it out loud with Book by voice.", timing: "About 2 minutes" },
  { icon: PhoneCall, title: "We call you to confirm", body: "A real person goes through the job with you and agrees the price before anything is booked.", timing: "Before anything is booked" },
  { icon: UserRound, title: "We send someone checked", body: "We arrange someone who has passed our checks, and tell you their name before they arrive.", timing: "On the day you chose" },
  { icon: CreditCard, title: "Pay when it's done", body: "Nothing to pay online. We tell you how to pay when we call.", timing: "Price agreed first" },
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

/** Shortcuts under the hero, straight into booking with the trade and job chosen. Slugs must exist in services.ts. */
export const popularJobs: { label: string; trade: Trade; job: string }[] = [
  { label: "Dripping tap", trade: "plumbing", job: "dripping-tap" },
  { label: "Mount a TV", trade: "handyman", job: "tv-mounting" },
  { label: "Boiler service", trade: "heating", job: "boiler-service" },
  { label: "Paint a room", trade: "painting", job: "paint-room" },
  { label: "Fuse box tripping", trade: "electrical", job: "fuse-tripping" },
];

export const ctaChecklist = ["Price agreed before booking", "Every tradesperson checked", "Book by voice, phone or online"];

export const faqs: Faq[] = [
  { question: "How do you check tradespeople?", answer: "We check government photo ID, see a basic DBS certificate every year, look them up on the register for their trade, and check their insurance certificate." },
  { question: "What if the job costs more than the price shown?", answer: "The prices on the site are starting prices. We agree the full price with you on the phone before anything is booked, and nothing extra happens until you say yes." },
  { question: "Can I book without using the website?", answer: "Yes. Call us between 8am and 8pm and we will book it for you. Or use Book by voice, which asks one question at a time." },
  { question: "When do I pay?", answer: "Only once the job is finished and you've checked it. Nothing is taken when you book. We tell you how to pay when we call to confirm." },
];
