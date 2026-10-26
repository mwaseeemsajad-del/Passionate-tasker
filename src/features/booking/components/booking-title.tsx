"use client";

import { useSearchParams } from "next/navigation";
import { getService } from "@/data/services";

export const DEFAULT_BOOKING_TITLE = "Book a checked tradesperson";

/** The booking page's h1, naming the trade when the visitor came from one: "Book a painter and decorator". */
export function BookingTitle() {
  const service = getService(useSearchParams().get("trade"));
  return <h1 className="text-display">{service ? `Book ${service.person}` : DEFAULT_BOOKING_TITLE}</h1>;
}
