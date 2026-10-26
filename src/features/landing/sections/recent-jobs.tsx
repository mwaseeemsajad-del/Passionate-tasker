import { Container, Section, SectionHeader } from "@/components/ui";
import { recentJobs } from "@/data/landing";
import { Carousel } from "../components/carousel";
import { JobCard } from "../components/job-card";

/** Recent jobs (Design.md 6.8 "Projects"): dark slab with a horizontal carousel. */
export function RecentJobs() {
  return (
    <Section id="recent-jobs" tone="dark" aria-labelledby="jobs-title">
      <Container>
        <SectionHeader id="jobs-title" align="center" tone="dark" eyebrow="Recent jobs" title="Done this week across London" className="mb-12" />
        <Carousel label="Recent jobs">
          {recentJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </Carousel>
      </Container>
    </Section>
  );
}
