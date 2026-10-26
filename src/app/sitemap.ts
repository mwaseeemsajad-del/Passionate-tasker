import type { MetadataRoute } from "next";
import { site } from "@/data/site";

// Public pages only. Booking is left out and marked noindex.
const pages = ["", "/how-it-works", "/trust", "/accessibility"];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((path) => ({ url: `${site.url}${path}`, changeFrequency: "monthly", priority: path === "" ? 1 : 0.7 }));
}
