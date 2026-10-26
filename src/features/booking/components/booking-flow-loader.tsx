"use client";

import dynamic from "next/dynamic";

/*
 * The booking form only renders in the browser: it starts from answers kept
 * in this tab (sessionStorage) and checks whether the browser can do voice,
 * neither of which the server can know. Rendering it on the server too gave a
 * different first picture and a hydration mismatch.
 */
export const BookingFlowLoader = dynamic(() => import("./booking-flow").then((m) => m.BookingFlow), {
  ssr: false,
  loading: () => <p className="text-text-3">Loading the booking form…</p>,
});
