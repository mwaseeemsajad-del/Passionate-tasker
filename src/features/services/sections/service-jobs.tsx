import { Container, Section, SectionHeader } from "@/components/ui";
import { OTHER_JOB, PRICE_NOTE } from "@/data/services";
import type { Service } from "@/types/content";
import { ServiceJobCard } from "../components/service-job-card";

/** Every job this trade does, each one a direct link into booking. */
export function ServiceJobs({ service }: { service: Service }) {
  return (
    <Section id="jobs" aria-labelledby="jobs-title" density="dense">
      <Container className="grid gap-10">
        <SectionHeader
          id="jobs-title"
          eyebrow="Popular jobs"
          title="Choose your job"
          subtitle={PRICE_NOTE}
        />
        <ul className="grid gap-4 md:grid-cols-2">
          {[...service.jobs, OTHER_JOB].map((job) => (
            <ServiceJobCard key={job.slug} trade={service.slug} job={job} />
          ))}
        </ul>
      </Container>
    </Section>
  );
}
