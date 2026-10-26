import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Card, Container, IconCircle, Section, SectionHeader } from "@/components/ui";
import { checksFor, recheckNote } from "@/data/trust";
import type { Service } from "@/types/content";

/** What is checked before this trade's tradespeople are sent, in the trust page's own words. */
export function ServiceChecks({ service }: { service: Service }) {
  const checks = checksFor(service.slug);
  return (
    <Section id="checks" aria-labelledby="checks-title" density="dense">
      <Container className="grid gap-10">
        <SectionHeader
          id="checks-title"
          eyebrow="Before anyone comes"
          title={`What we check before ${service.person} comes`}
          subtitle={recheckNote}
        />
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {checks.map((check) => (
            <li key={check.id} className="grid">
              <Card className="grid content-start gap-3">
                <IconCircle icon={BadgeCheck} />
                <h3 className="text-h4">{check.title}</h3>
                <p className="text-base text-text-3">{check.body[0]}</p>
              </Card>
            </li>
          ))}
        </ul>
        <p className="text-text-2">
          <Link href="/trust" className="font-semibold text-ink underline underline-offset-4">
            Read exactly what each check covers
          </Link>
        </p>
      </Container>
    </Section>
  );
}
