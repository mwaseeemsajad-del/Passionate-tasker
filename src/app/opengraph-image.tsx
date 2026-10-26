import { ImageResponse } from "next/og";
import { site } from "@/data/site";

// The picture shown when a link to the site is shared. ImageResponse cannot
// read CSS variables, so the brand colours are repeated here from globals.css
// (--color-ink, --color-accent, --color-paper).
const INK = "#0f110f";
const ACCENT = "#02cd31";
const PAPER = "#ffffff";

export const alt = `${site.name}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: INK, color: PAPER }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: ACCENT, color: INK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700 }}>
            {site.shortName}
          </div>
          <div style={{ fontSize: 36, fontWeight: 600 }}>{site.name}</div>
        </div>
        <div style={{ fontSize: 76, fontWeight: 600, lineHeight: 1.1, maxWidth: 950 }}>{site.tagline}</div>
        <div style={{ fontSize: 30, color: ACCENT }}>Book by voice, online or by phone</div>
      </div>
    ),
    size,
  );
}
