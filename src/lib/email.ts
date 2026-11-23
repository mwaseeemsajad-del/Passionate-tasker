import "server-only";

/*
 * Sends one email through Resend's HTTP API (no SDK needed).
 * Server only: RESEND_API_KEY must never get a NEXT_PUBLIC_ prefix.
 * Never throws: a failed email must not lose the booking it reports.
 *
 * Login codes, sign-up and password emails do not come through here:
 * Supabase sends those itself, through Resend's SMTP set in its dashboard,
 * using the templates in supabase/templates.
 */
const API_KEY = process.env.RESEND_API_KEY ?? "";
// Resend's test sender works without a verified domain, but only to the Resend account's own address.
const FROM = process.env.RESEND_FROM || "Passionate Taskers <onboarding@resend.dev>";

export type EmailContent = { subject: string; html: string; text: string };

export async function sendEmail(to: string, { subject, html, text }: EmailContent): Promise<boolean> {
  if (!API_KEY || !to) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [to], subject: subject.replace(/[\r\n]+/g, " ").slice(0, 200), html, text }),
    });
    if (!res.ok) console.error("Resend email failed", res.status, await res.text());
    return res.ok;
  } catch (error) {
    console.error("Resend email failed", error);
    return false;
  }
}

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/*
 * The one email layout: dark copper brand, big readable text (18px body),
 * real headings and a details table, so screen readers and older eyes cope.
 * Hex values live here because email clients cannot read the site's CSS tokens.
 */
export function emailLayout(o: { subject: string; heading: string; paragraphs: string[]; details?: [string, string][]; footer?: string }): EmailContent {
  const rows = (o.details ?? [])
    .map(
      ([k, v]) =>
        `<tr><th scope="row" align="left" style="padding:10px 16px 10px 0;color:#b9ac9c;font-weight:600;vertical-align:top;white-space:nowrap">${escape(k)}</th><td style="padding:10px 0;color:#f3ece3">${escape(v)}</td></tr>`,
    )
    .join("");
  const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>${escape(o.subject)}</title></head>
<body style="margin:0;padding:0;background:#17140f;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:18px;line-height:1.5;color:#f3ece3">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#17140f"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="padding-bottom:24px"><span style="display:inline-block;background:#c87f41;color:#1a140e;font-weight:700;border-radius:8px;padding:6px 9px">PT</span> <span style="font-weight:600;font-size:20px;color:#f3ece3">Passionate Taskers</span></td></tr>
<tr><td style="background:#201c17;border:1px solid #332c24;border-radius:16px;padding:28px">
<h1 style="margin:0 0 16px;font-size:26px;line-height:1.25;color:#f3ece3">${escape(o.heading)}</h1>
${o.paragraphs.map((p) => `<p style="margin:0 0 16px;color:#f3ece3">${escape(p)}</p>`).join("")}
${rows ? `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid #332c24;margin-top:8px">${rows}</table>` : ""}
</td></tr>
<tr><td style="padding:20px 4px;font-size:15px;color:#b9ac9c">${escape(o.footer ?? "Passionate Taskers: checked local trades, at a price you agree first.")}</td></tr>
</table></td></tr></table></body></html>`;
  const text = [o.heading, "", ...o.paragraphs.flatMap((p) => [p, ""]), ...(o.details ?? []).map(([k, v]) => `${k}: ${v}`), "", o.footer ?? "Passionate Taskers"].join("\n");
  return { subject: o.subject, html, text };
}
