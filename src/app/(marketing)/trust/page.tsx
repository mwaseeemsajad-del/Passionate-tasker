import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui";
import { site } from "@/data/site";
import { checks, gasEmergency, recheckNote } from "@/data/trust";
import { InfoPage, InfoSection, PointList, Prose } from "@/features/info/info-page";

export const metadata: Metadata = {
  title: "Trust and safety",
  description: "Exactly what we check before a tradesperson is sent to your home, and what to do if something goes wrong.",
};

export default function TrustPage() {
  return (
    <InfoPage
      eyebrow="Trust and safety"
      title="What we check before anyone comes to your door"
      lede="Letting a stranger into your home takes trust. So we say exactly what we check, in plain words, instead of using a badge that just says “verified”."
    >
      <InfoSection id="checks" title="The checks">
        <PointList
          items={checks.map((c) => ({
            title: c.title,
            body: (
              <div className="grid gap-2">
                <p className="text-[0.9375rem] font-semibold text-text-3">{c.appliesTo}</p>
                {c.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            ),
          }))}
        />
        <p className="text-text-2">{recheckNote}</p>
      </InfoSection>

      <InfoSection id="on-the-day" title="On the day">
        <Prose>
          <p>We tell you the name of the person coming before they arrive. When they arrive, ask to see their photo ID, and for gas work, their Gas Safe ID card.</p>
          <p>If the person at the door is not the person we named, do not let them in. Call us.</p>
        </Prose>
      </InfoSection>

      <InfoSection id="gas" title="If you smell gas">
        <p role="note" className="flex gap-3 rounded-lg border-2 border-danger p-5 font-semibold">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-danger" strokeWidth={2} />
          {gasEmergency}
        </p>
      </InfoSection>

      <InfoSection id="problems" title="If something goes wrong">
        <Prose>
          <p>
            Call us on <a href={site.phone.href}>{site.phone.display}</a>, {site.supportHours}. Tell us what happened. We will talk to the
            tradesperson, and if they did not meet these standards, they will not be sent to anyone again.
          </p>
        </Prose>
        <div>
          <Button href="/book">Book a checked tradesperson</Button>
        </div>
      </InfoSection>
    </InfoPage>
  );
}
