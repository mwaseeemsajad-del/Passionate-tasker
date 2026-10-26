import "server-only";
import { getProviderBookings, getProviderChecks, getProviderProfile, requireRole } from "@/features/accounts/data";

/** Everything the tradesperson dashboard pages show, read once per page, grouped the way the pages use it. */
export async function loadProviderDashboard() {
  const viewer = await requireRole("provider");
  const [profile, checks, bookings] = await Promise.all([getProviderProfile(viewer.id), getProviderChecks(viewer.id), getProviderBookings(viewer.id)]);
  const today = new Date().toISOString().slice(0, 10);
  return {
    viewer,
    profile,
    checks,
    waiting: bookings.filter((b) => b.status === "offered"),
    booked: bookings.filter((b) => b.status === "accepted"),
    upcoming: bookings.filter((b) => b.status === "accepted" && b.preferredDate >= today),
    past: bookings.filter((b) => b.status === "completed" || b.status === "declined" || b.status === "cancelled"),
    done: bookings.filter((b) => b.status === "completed"),
    checksDone: checks.filter((c) => c.status === "approved").length,
    firstName: viewer.fullName.split(" ")[0] || "there",
  };
}
