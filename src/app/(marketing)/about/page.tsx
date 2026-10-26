import type { Metadata } from "next";
import { Media } from "@/components/ui";
import { photos } from "@/data/photos";
import { site } from "@/data/site";
import { InfoPage, InfoSection, PointList, Prose } from "@/features/info/info-page";

export const metadata: Metadata = {
  title: "About us",
  description: "Why Passionate Taskers exists: checked local trades, built first for older customers, people living alone and screen reader users.",
};

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="About us"
      title="Letting a stranger into your home should feel safe"
      lede={`${site.name} books checked local tradespeople in ${site.area}. We built it first for the people who worry most about who comes to the door.`}
    >
      <Media alt="smiling older woman in her living room" src={photos.about} ratio="16/9" radius="xl" sizes="(min-width: 992px) 760px, 100vw" />

      <InfoSection id="why" title="Why we started">
        <Prose>
          <p>
            Most booking sites are built for people who are quick on a phone screen. Older customers, people living alone, and anyone who uses a
            screen reader are left to work it out, or to ring around and hope. We think they deserve the easiest booking, not the hardest.
          </p>
        </Prose>
      </InfoSection>

      <InfoSection id="different" title="What we do differently">
        <PointList
          items={[
            { title: "We say exactly what we check", body: <p>Not a badge that says “verified”, but the actual checks: photo ID, DBS, insurance and the right register. <a href="/trust">See the checks</a>.</p> },
            { title: "You can book by voice", body: <p>One question at a time, every answer read back, and nothing moves on without your yes.</p> },
            { title: "A real person calls you", body: <p>We agree the job, the time and the price with you before anything is booked, and tell you who is coming.</p> },
            { title: "Every page works for everyone", body: <p>Larger text, high contrast, full keyboard use and screen readers. <a href="/accessibility">Read our accessibility statement</a>.</p> },
          ]}
        />
      </InfoSection>

      <InfoSection id="contact" title="Talk to us">
        <Prose>
          <p>
            Call us on <a href={site.phone.href}>{site.phone.display}</a>, {site.supportHours}. Are you a tradesperson? <a href="/join">Join us</a>.
          </p>
        </Prose>
      </InfoSection>
    </InfoPage>
  );
}
