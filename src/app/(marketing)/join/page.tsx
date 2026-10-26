import type { Metadata } from "next";
import { Button } from "@/components/ui";
import { checks, recheckNote } from "@/data/trust";
import { InfoSection, InfoPage, PointList, Prose } from "@/features/info/info-page";

export const metadata: Metadata = {
  title: "Join as a tradesperson",
  description: "Take jobs from Passionate Taskers. Create an account, tell us your trade, and we arrange the checks.",
};

export default function JoinPage() {
  return (
    <InfoPage
      eyebrow="For tradespeople"
      title="Join as a tradesperson"
      lede="Create an account, tell us about your trade and where you work, and we arrange the checks. Nobody is sent to a job until every check is done."
    >
      <InfoSection id="how" title="How it works">
        <Prose>
          <p>Once you are checked, we offer you jobs near you. You see each one on your dashboard and accept or decline it. Our team agrees the price with the customer before the job is offered to you.</p>
        </Prose>
        <div className="flex flex-wrap items-center gap-4">
          <Button href="/signup/provider">Create tradesperson account</Button>
          <Button href="/login" variant="outline">
            Log in
          </Button>
        </div>
      </InfoSection>

      <InfoSection id="checks" title="What we check">
        <PointList items={checks.map((c) => ({ title: c.title, body: <p>{c.appliesTo}.</p> }))} />
        <p className="text-text-2">{recheckNote}</p>
      </InfoSection>
    </InfoPage>
  );
}
