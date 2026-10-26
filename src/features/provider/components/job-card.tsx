import { CalendarDays, MapPin, NotebookText, Phone, UserRound, Wrench } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { jobName, postcodeArea, providerStatus, tradeName, when } from "@/features/accounts/booking-status";
import type { BookingRequest } from "@/types/accounts";
import { JobActions } from "./job-actions";

/*
 * One job on the tradesperson dashboard: who booked it, what they want, when
 * and where. The customer's name is always shown; their phone number and
 * full postcode appear once the tradesperson has accepted, so a customer's
 * contact details only go to the person who is actually coming.
 */
export function JobCard({ booking }: { booking: BookingRequest }) {
  const accepted = booking.status === "accepted" || booking.status === "completed";
  const name = jobName(booking);
  const sent = new Date(booking.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long" });

  return (
    <li className="grid">
      <Card className="grid content-start gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1">
            <h3 className="text-h4">{name}</h3>
            <p className="text-[0.9375rem] text-text-3">
              Ref {booking.reference} · Requested {sent}
            </p>
          </div>
          <Badge tone={booking.status === "offered" ? "white" : "tint"} className={booking.status === "offered" ? "border border-ink" : undefined}>
            {providerStatus[booking.status]}
          </Badge>
        </div>

        <dl className="grid gap-3 text-base sm:grid-cols-2">
          <Detail icon={UserRound} term="Booked by">
            {booking.name}
          </Detail>
          <Detail icon={Wrench} term="Service">
            {tradeName(booking)}
          </Detail>
          <Detail icon={CalendarDays} term="When">
            {when(booking)}
          </Detail>
          <Detail icon={MapPin} term="Where">
            {accepted ? booking.postcode : `${postcodeArea(booking.postcode)} area`}
          </Detail>
          {accepted && (
            <Detail icon={Phone} term="Phone">
              <a href={`tel:${booking.phone.replace(/\s/g, "")}`} className="font-semibold underline underline-offset-4">
                {booking.phone}
              </a>
            </Detail>
          )}
        </dl>

        {booking.details && (
          <div className="grid gap-1.5 rounded-md bg-accent-50 p-4">
            <p className="flex items-center gap-2 text-[0.9375rem] font-semibold">
              <NotebookText aria-hidden="true" className="size-4" strokeWidth={1.5} />
              Customer’s notes
            </p>
            <p className="text-base text-text-2">{booking.details}</p>
          </div>
        )}

        {booking.status === "offered" && (
          <>
            {booking.matchMode === "customer" && <p className="font-semibold">The customer chose you for this job.</p>}
            <p className="text-[0.9375rem] text-text-3">Accept to see the customer’s phone number and full address.</p>
            <JobActions bookingId={booking.id} mode="respond" label={name} />
          </>
        )}
        {booking.status === "accepted" && <JobActions bookingId={booking.id} mode="complete" label={name} />}
      </Card>
    </li>
  );
}

function Detail({ icon: Icon, term, children }: { icon: typeof UserRound; term: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <Icon aria-hidden="true" className="mt-1 size-5 shrink-0 text-text-3" strokeWidth={1.5} />
      <div className="grid">
        <dt className="text-[0.9375rem] text-text-3">{term}</dt>
        <dd className="font-medium">{children}</dd>
      </div>
    </div>
  );
}
