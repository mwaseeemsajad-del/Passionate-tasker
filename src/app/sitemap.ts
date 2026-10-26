import type { MetadataRoute } from "next";
import { services } from "@/data/services";
import { site } from "@/data/site";

// Public pages only. Booking is left out and marked noindex.
const pages = ["", "/services", ...services.map((s) => `/services/${s.slug}`), "/how-it-works", "/pricing", "/help", "/about", "/trust", "/accessibility", "/join", "/signup", "/signup/provider", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((path) => ({ url: `${site.url}${path}`, changeFrequency: "monthly", priority: path === "" ? 1 : 0.7 }));
}
