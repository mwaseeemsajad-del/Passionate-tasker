import type { Metadata } from "next";
import Link from "next/link";
import { Phone, TriangleAlert } from "lucide-react";
import { Accordion, Button, Card } from "@/components/ui";
import { helpTopics } from "@/data/help";
import { site } from "@/data/site";
import { gasEmergency } from "@/data/trust";
import { InfoPage, InfoSection } from "@/features/info/info-page";

export const metadata: Metadata = {
  title: "Help",
  description: "Answers about booking, prices, safety checks, Book by voice, accounts and joining as a tradesperson.",
};

export default function HelpPage() {
  return (
    <InfoPage
      eyebrow="Help"
      title="How can we help?"
      lede={
        <>
          Answers to the questions people ask most. Can’t find yours? Call us on{" "}
          <a href={site.phone.href} className="font-semibold underline underline-offset-4">
            {site.phone.display}
          </a>
          , {site.supportHours}.
        </>
      }
    >
      <nav aria-labelledby="topics-title" className="grid gap-3">
        <h2 id="topics-title" className="text-h4">
          Topics
        </h2>
        <ul className="flex flex-wrap gap-2">
          {helpTopics.map((t) => (
            <li key={t.id}>
              <a
                href={`#${t.id}`}
                className="inline-flex min-h-11 items-center rounded-full border border-line bg-white px-4 font-medium transition-colors hover:border-ink"
              >
                {t.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <p role="note" className="flex gap-3 rounded-lg border-2 border-danger p-5 font-semibold">
        <TriangleAlert aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-danger" strokeWidth={2} />
        {gasEmergency}
      </p>

      {helpTopics.map((topic) => (
        <InfoSection key={topic.id} id={topic.id} title={topic.title} className="scroll-mt-24">
          <Accordion items={topic.items} defaultOpen={null} />
        </InfoSection>
      ))}

      <InfoSection id="contact" title="Still need help?">
        <Card variant="tint" className="grid gap-4">
          <p className="flex items-center gap-3 text-h4">
            <Phone aria-hidden="true" className="size-5" strokeWidth={1.5} />
            <a href={site.phone.href} className="font-semibold underline underline-offset-4">
              {site.phone.display}
            </a>
          </p>
          <p className="text-text-2">{site.supportHours}. A real person answers, and can book your job for you over the phone.</p>
          <p className="text-text-2">
            More about <Link href="/trust" className="font-semibold underline underline-offset-4">our checks</Link> and{" "}
            <Link href="/accessibility" className="font-semibold underline underline-offset-4">accessibility</Link>.
          </p>
          <div>
            <Button href="/book">Book a job</Button>
          </div>
        </Card>
      </InfoSection>
    </InfoPage>
  );
}
