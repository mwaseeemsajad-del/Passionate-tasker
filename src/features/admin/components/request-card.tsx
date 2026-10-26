import { CalendarDays, MapPin, Phone, UserRound } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { jobName, providerStatus, tradeName, when } from "@/features/accounts/booking-status";
import type { BookingRequest, ProviderSummary } from "@/types/accounts";
import { BookingStatusControls, OfferControl } from "./controls";

export type AdminBooking = BookingRequest & { providerId: string | null };

const MATCH_WORDS: Record<BookingRequest["matchMode"], string> = {
  customer: "Customer chose",
  auto: "Matched automatically",
  team: "Team to arrange",
};

/** One booking request for the team: the customer, the job, who it is with, and what to do next. */
export function RequestCard({ booking, approved, providerName }: { booking: AdminBooking; approved: ProviderSummary[]; providerName: string | null }) {
  const name = jobName(booking);
  const matching = approved.filter((p) => p.trades.includes(booking.trade)).map((p) => ({ id: p.id, name: `${p.fullName} (${p.postcode})` }));
  const canOffer = booking.status === "new" || booking.status === "declined" || booking.status === "offered";
  return (
    <li className="grid">
      <Card className="grid content-start gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1">
            <h3 className="text-h4">{name}</h3>
            <p className="text-[0.9375rem] text-text-3">
              {tradeName(booking)} · Ref {booking.reference} · Sent {new Date(booking.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{booking.status === "new" ? "New" : providerStatus[booking.status]}</Badge>
            <Badge tone="white" className="border border-line">
              {MATCH_WORDS[booking.matchMode]}
            </Badge>
          </div>
        </div>
        <ul className="grid gap-2 text-base">
          <li className="flex items-start gap-2.5">
            <Phone aria-hidden="true" className="mt-0.5 size-5 shrink-0" strokeWidth={1.5} />
            <span>
              {booking.name},{" "}
              <a href={`tel:${booking.phone.replace(/\s/g, "")}`} className="font-semibold underline underline-offset-4">
                {booking.phone}
              </a>
              {booking.email && <>, {booking.email}</>}
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CalendarDays aria-hidden="true" className="mt-0.5 size-5 shrink-0" strokeWidth={1.5} />
            {when(booking)}
          </li>
          <li className="flex items-start gap-2.5">
            <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0" strokeWidth={1.5} />
            {booking.postcode}
          </li>
          {providerName && booking.status !== "new" && (
            <li className="flex items-start gap-2.5">
              <UserRound aria-hidden="true" className="mt-0.5 size-5 shrink-0" strokeWidth={1.5} />
              {providerName}
            </li>
          )}
        </ul>
        {booking.details && <p className="rounded-md bg-accent-50 p-4 text-base text-text-2">{booking.details}</p>}
        {canOffer && <OfferControl bookingId={booking.id} label={name} providers={matching} current={booking.providerId} />}
        <BookingStatusControls bookingId={booking.id} label={name} status={booking.status} />
      </Card>
    </li>
  );
}
