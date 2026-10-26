import "server-only";
import { getAllBookings, getAllProviders, requireRole } from "@/features/accounts/data";

/** Everything the team pages show, read once per page and grouped by what the team does next. */
export async function loadAdmin() {
  const viewer = await requireRole("admin");
  const [bookings, providers] = await Promise.all([getAllBookings(), getAllProviders()]);
  const approved = providers.filter((p) => p.status === "approved");
  return {
    viewer,
    providers,
    approved,
    // Joined, but not yet approved: the team's checks to do.
    toApprove: providers.filter((p) => p.status !== "approved" && p.onboardedAt),
    // Still filling in the joining steps: nothing for the team to do yet.
    joining: providers.filter((p) => !p.onboardedAt),
    needsPerson: bookings.filter((b) => b.status === "new" || b.status === "declined"),
    offered: bookings.filter((b) => b.status === "offered"),
    booked: bookings.filter((b) => b.status === "accepted"),
    closed: bookings.filter((b) => b.status === "completed" || b.status === "cancelled"),
    nameOf: (id: string | null) => providers.find((p) => p.id === id)?.fullName || "a tradesperson",
  };
}

export type AdminData = Awaited<ReturnType<typeof loadAdmin>>;
