import type { Metadata } from "next";
import { site } from "@/data/site";
import { DraftNotice } from "@/features/info/draft-notice";
import { InfoPage, InfoSection, PointList, Prose } from "@/features/info/info-page";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What we collect when you book or apply, why, how long we keep it, and who sees it.",
};

// DRAFT for the client to review. Matches what the MVP actually does: a
// booking or application is saved, and the team phones the person.
export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Privacy"
      title="How we use your information"
      lede="We only ask for what we need to arrange your job, and we never sell it."
      updated={site.legal.updated}
    >
      <DraftNotice />

      <InfoSection id="collect" title="What we collect">
        <PointList
          items={[
            {
              title: "When you book a job",
              body: <p>The trade and job, the postcode, the day and time you want, any notes you add, your name and phone number, and your email address if you give it.</p>,
            },
            {
              title: "When you apply as a tradesperson",
              body: <p>Your name, phone number, email if given, the postcode you work from, your trades, your registration numbers and what you tell us about your work. During checks we also see your ID, DBS certificate and insurance.</p>,
            },
            {
              title: "When you use Book by voice",
              body: (
                <p>
                  Your browser turns your speech into words. In Chrome and Edge this is done by the browser maker’s speech service, not by us. We
                  only receive the answers that end up in the form. We do not record your voice.
                </p>
              ),
            },
            {
              title: "Display settings",
              body: <p>Larger text and high contrast are remembered on your own device only. They are not sent to us.</p>,
            },
          ]}
        />
      </InfoSection>

      <InfoSection id="why" title="Why we use it">
        <Prose>
          <p>To call you, arrange a checked tradesperson, tell them where to go and what the job is, and deal with any problem afterwards.</p>
          <p>For tradespeople: to decide whether we can send you to jobs, and to keep your checks up to date.</p>
          <p>The legal basis is that we need it to do what you asked us to do. For tradesperson checks, it is also our legitimate interest in keeping customers safe.</p>
        </Prose>
      </InfoSection>

      <InfoSection id="who" title="Who sees it">
        <Prose>
          <p>Our team. The tradesperson sent to your job sees your name, phone number, postcode and the job details, and nothing else.</p>
          <p>We use service providers to store data and send emails. They may only use it to provide that service to us.</p>
        </Prose>
      </InfoSection>

      <InfoSection id="keep" title="How long we keep it">
        <Prose>
          <p>Booking requests that do not go ahead: deleted after 12 months. Finished jobs: kept for 6 years, for guarantees, disputes and tax.</p>
          <p>Tradesperson applications that do not go ahead: deleted after 12 months.</p>
        </Prose>
      </InfoSection>

      <InfoSection id="rights" title="Your rights">
        <Prose>
          <p>
            You can ask for a copy of what we hold about you, ask us to correct it, or ask us to delete it. Call us on{" "}
            <a href={site.phone.href}>{site.phone.display}</a>, {site.supportHours}.
          </p>
          <p>
            If you are unhappy with how we have used your information, you can complain to the Information Commissioner’s Office (ICO) on
            0303 123 1113.
          </p>
          <p>
            {site.legal.company}, {site.legal.address}. {site.legal.email}.
          </p>
        </Prose>
      </InfoSection>
    </InfoPage>
  );
}
