"use client";

import type { ImageLoaderProps } from "next/image";

/*
 * Every <Image> goes through here (next.config.ts → images.loaderFile).
 *
 * Unsplash resizes on its own CDN, so we ask it for the exact width instead
 * of making our server download and re-encode the full-size original.
 * When real photos move to Supabase Storage, add its transform URL here.
 * Anything else is served as-is.
 */
export default function imageLoader({ src, width, quality }: ImageLoaderProps) {
  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality ?? 75));
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    return url.toString();
  }
  return src;
}
