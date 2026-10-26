import { CalendarCheck, CalendarDays, CircleCheckBig, Clock, MapPin, UserRound } from "lucide-react";
import { Badge, Button, Card, MetricCard } from "@/components/ui";
import { site } from "@/data/site";
import type { BookingRequest } from "@/types/accounts";
import { customerStatus, jobName, tradeName, when } from "../booking-status";
import { AccountHeader, DashboardSection, EmptyState } from "../components/account-header";
import { CancelBookingButton } from "../components/cancel-booking-button";
import { getCustomerBookings, requireRole } from "../data";

/** The customer's account: their bookings, current ones first, each with its status in words. */
export async function CustomerAccount() {
  const viewer = await requireRole("customer");
  const bookings = await getCustomerBookings(viewer.id);
  const current = bookings.filter((b) => b.status !== "completed" && b.status !== "cancelled");
  const past = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");
  const firstName = viewer.fullName.split(" ")[0] || "there";
  const booked = bookings.filter((b) => b.status === "accepted").length;
  const done = bookings.filter((b) => b.status === "completed").length;
  const arranging = current.length - booked;

  return (
    <div className="grid gap-14">
      <AccountHeader eyebrow="Your account" title={`Hello, ${firstName}`} action={<Button href="/book">Book a job</Button>}>
        <p className="text-text-2">Your bookings and where each one is up to.</p>
      </AccountHeader>

      <section aria-labelledby="numbers-title">
        <h2 id="numbers-title" className="sr-only">
          Your numbers
        </h2>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
          <MetricCard icon={Clock} label="Being arranged" value={arranging} hint="We will call you to confirm" />
          <MetricCard icon={CalendarCheck} label="Booked" value={booked} hint="A tradesperson is coming" />
          <MetricCard icon={CircleCheckBig} label="Done" value={done} />
        </div>
      </section>

      <DashboardSection id="current-title" title="Your bookings" count={current.length}>
        {current.length > 0 ? (
          <ul className="grid gap-4 lg:grid-cols-2">{current.map((b) => <BookingCard key={b.id} booking={b} />)}</ul>
        ) : (
          <EmptyState>No bookings yet. Book a job and it appears here.</EmptyState>
        )}
      </DashboardSection>

      {past.length > 0 && (
        <DashboardSection id="past-title" title="Past bookings" count={past.length}>
          <ul className="grid gap-4 lg:grid-cols-2">{past.map((b) => <BookingCard key={b.id} booking={b} />)}</ul>
        </DashboardSection>
      )}

      <p className="text-text-2">
        To change a booking, call us on{" "}
        <a href={site.phone.href} className="font-semibold underline underline-offset-4">
          {site.phone.display}
        </a>
        , {site.supportHours}.
      </p>
    </div>
  );
}

function BookingCard({ booking }: { booking: BookingRequest }) {
  const name = jobName(booking);
  const canCancel = booking.status === "new" || booking.status === "offered" || booking.status === "declined" || booking.status === "accepted";
  return (
    <li className="grid">
      <Card className="grid gap-4">
        <div className="grid gap-1">
          <h3 className="text-h4">{name}</h3>
          <p className="text-[0.9375rem] text-text-3">
            {tradeName(booking)} · Ref {booking.reference}
          </p>
        </div>
        <Badge className="w-fit">{customerStatus[booking.status]}</Badge>
        <ul className="grid gap-2 text-base">
          <li className="flex items-start gap-2.5">
            <CalendarDays aria-hidden="true" className="mt-0.5 size-5 shrink-0" strokeWidth={1.5} />
            {when(booking)}
          </li>
          <li className="flex items-start gap-2.5">
            <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0" strokeWidth={1.5} />
            {booking.postcode}
          </li>
          {booking.providerName && (
            <li className="flex items-start gap-2.5 font-semibold">
              <UserRound aria-hidden="true" className="mt-0.5 size-5 shrink-0" strokeWidth={1.5} />
              {booking.status === "completed" ? `Done by ${booking.providerName}` : `${booking.providerName} is coming. Ask to see their photo ID.`}
            </li>
          )}
        </ul>
        {canCancel && <CancelBookingButton bookingId={booking.id} label={name} />}
      </Card>
    </li>
  );
}
