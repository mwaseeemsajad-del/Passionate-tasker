import type { Metadata } from "next";
import { gasEmergency } from "@/data/trust";
import { site } from "@/data/site";
import { DraftNotice } from "@/features/info/draft-notice";
import { InfoPage, InfoSection, PointList, Prose } from "@/features/info/info-page";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "How booking with Passionate Taskers works, what we do, what the tradesperson does, and what happens if something goes wrong.",
};

// DRAFT for the client to review, written for the concierge MVP. Revisit when
// accounts, matching and online payment arrive (milestones 05, 07, 08).
export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Terms"
      title="Terms of use"
      lede="The plain-English rules for booking a job through us."
      updated={site.legal.updated}
    >
      <DraftNotice />

      <InfoSection id="what-we-do" title="What we do">
        <Prose>
          <p>
            {site.name} introduces you to a local tradesperson who has passed our checks. When you send a request, nothing is booked yet. We call
            you to agree the job, the time and the price, and only then arrange who comes.
          </p>
          <p>The tradesperson does the work and is responsible for its quality, and for following the law and safety rules for their trade.</p>
        </Prose>
      </InfoSection>

      <InfoSection id="booking" title="Booking and prices">
        <PointList
          items={[
            { title: "Starting prices", body: <p>Prices on the site are starting prices. The full price is agreed with you on the phone before anything is booked.</p> },
            { title: "Extra work", body: <p>If the tradesperson finds more to do, nothing extra happens and nothing extra is charged until you say yes.</p> },
            { title: "Paying", body: <p>There is nothing to pay online. You pay when the job is done. We tell you how when we call.</p> },
            {
              title: "Changing or cancelling",
              body: (
                <p>
                  Call us on <a href={site.phone.href}>{site.phone.display}</a> as early as you can. Cancelling before we have confirmed who is coming costs
                  nothing.
                </p>
              ),
            },
          ]}
        />
      </InfoSection>

      <InfoSection id="your-rights" title="Your rights">
        <Prose>
          <p>
            Nothing in these terms takes away your rights under the Consumer Rights Act 2015: work must be done with reasonable care and skill, in
            a reasonable time, and for the price agreed.
          </p>
        </Prose>
      </InfoSection>

      <InfoSection id="safety" title="Gas and emergencies">
        <Prose>
          <p>We are not an emergency service. {gasEmergency}</p>
          <p>Gas work is only done by Gas Safe registered engineers, and certified electrical work only by members of a scheme such as NICEIC or NAPIT.</p>
        </Prose>
      </InfoSection>

      <InfoSection id="problems" title="If something goes wrong">
        <Prose>
          <p>
            Call us on <a href={site.phone.href}>{site.phone.display}</a>, {site.supportHours}. We will talk to the tradesperson and help put it right.
          </p>
          <p>
            {site.legal.company}, {site.legal.address}. {site.legal.email}.
          </p>
        </Prose>
      </InfoSection>
    </InfoPage>
  );
}
