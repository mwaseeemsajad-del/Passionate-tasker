import "server-only";
import { site } from "@/data/site";
import { getService, jobsFor } from "@/data/services";
import { emailLayout, sendEmail } from "@/lib/email";
import { SLOTS } from "./draft";

/*
 * Emails about a booking, to the customer and to the team. Both sides hear
 * about every new request and every cancellation. Called through `after()`,
 * so they never slow down or undo the booking itself.
 */

/** The booking_requests columns the emails need. */
export type BookingRow = {
  reference: string;
  trade: string;
  job: string;
  postcode: string;
  details: string;
  preferred_date: string;
  slot: string;
  name: string;
  phone: string;
  email: string;
};

export const BOOKING_COLUMNS = "reference, trade, job, postcode, details, preferred_date, slot, name, phone, email";

const TEAM = process.env.BOOKING_TEAM_EMAIL ?? "";

function details(b: BookingRow): [string, string][] {
  const service = getService(b.trade);
  const job = jobsFor(service?.slug ?? "").find((j) => j.slug === b.job);
  const slot = SLOTS.find((s) => s.id === b.slot);
  const date = new Date(`${b.preferred_date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return [
    ["Reference", b.reference],
    ["Job", `${service?.name ?? b.trade}: ${job?.name ?? b.job}`],
    ["When", `${date}, ${slot ? `${slot.label.toLowerCase()} (${slot.hours})` : b.slot}`],
    ["Postcode", b.postcode],
    ["Details", b.details.trim() || "None given"],
  ];
}

const contact = (b: BookingRow): [string, string][] => [
  ["Customer", b.name],
  ["Phone", b.phone],
  ["Email", b.email || "None given"],
];

export async function emailBookingPlaced(b: BookingRow, chosen: string) {
  await Promise.all([
    sendEmail(
      b.email,
      emailLayout({
        subject: `We have your request ${b.reference}`,
        heading: "We have your request",
        paragraphs: [
          `Hello ${b.name.trim()}, thank you for booking with Passionate Taskers.`,
          "Someone from our team will call you on the number you gave, to agree the price and the time. Nothing is charged until you agree.",
        ],
        details: details(b),
        footer: `To change it, call us on ${site.phone.display}. You can cancel it from your account page.`,
      }),
    ),
    sendEmail(
      TEAM,
      emailLayout({
        subject: `New booking ${b.reference}: ${b.trade}, ${b.postcode}`,
        heading: `New booking ${b.reference}`,
        paragraphs: ["A customer has sent a new request. Please call them to agree the price and the time."],
        details: [...details(b), ...contact(b), ["Tradesperson chosen", chosen || "None, match automatically"]],
      }),
    ),
  ]);
}

export async function emailBookingCancelled(b: BookingRow, by: "customer" | "team") {
  await Promise.all([
    sendEmail(
      b.email,
      emailLayout({
        subject: `Your request ${b.reference} is cancelled`,
        heading: "Your request is cancelled",
        paragraphs: [
          by === "customer"
            ? `Hello ${b.name.trim()}, you cancelled this request. Nobody will come, and you have not been charged.`
            : `Hello ${b.name.trim()}, our team has cancelled this request. Nobody will come, and you have not been charged.`,
          `If this is a mistake, or you would like to book again, call us on ${site.phone.display}.`,
        ],
        details: details(b),
      }),
    ),
    sendEmail(
      TEAM,
      emailLayout({
        subject: `Cancelled ${b.reference}: ${b.trade}, ${b.postcode}`,
        heading: `Booking ${b.reference} cancelled`,
        paragraphs: [by === "customer" ? "The customer cancelled this request from their account." : "This request was cancelled from the team pages."],
        details: [...details(b), ...contact(b)],
      }),
    ),
  ]);
}
