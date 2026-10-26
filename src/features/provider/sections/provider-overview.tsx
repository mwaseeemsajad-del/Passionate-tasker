import Link from "next/link";
import { BadgeCheck, Briefcase, CalendarCheck, CircleCheckBig, Clock } from "lucide-react";
import { Badge, Button, Card, MetricCard } from "@/components/ui";
import { getService } from "@/data/services";
import { AccountHeader, DashboardSection, EmptyState } from "@/features/accounts/components/account-header";
import { accountStatus } from "@/features/accounts/booking-status";
import { JobCard } from "../components/job-card";
import { loadProviderDashboard } from "../load";

/*
 * The tradesperson's overview: status, the numbers that matter, what to do
 * next, the next booked job and the jobs waiting for an answer.
 */
export async function ProviderOverview({ welcome }: { welcome: boolean }) {
  const d = await loadProviderDashboard();
  const onboarded = Boolean(d.profile?.onboardedAt);
  const next = d.upcoming[0];

  return (
    <div className="grid gap-12">
      <AccountHeader
        eyebrow="Tradesperson dashboard"
        title={`Hello, ${d.firstName}`}
        action={onboarded ? <Button href="/provider/jobs">See all jobs</Button> : <Button href="/provider/onboarding">Finish joining</Button>}
      >
        <div className="flex flex-wrap gap-2">
          {d.profile && <Badge tone="white" className="border border-ink">{accountStatus[d.profile.status]}</Badge>}
          {d.profile?.trades.map((t) => <Badge key={t}>{getService(t)?.name ?? t}</Badge>)}
        </div>
      </AccountHeader>

      {welcome && (
        <p role="status" className="rounded-lg border-2 border-ink bg-accent-50 p-5 font-semibold">
          You are all set up. We will call you to arrange your checks. Once they are done, jobs we offer you appear here.
        </p>
      )}

      {!onboarded && d.profile && <OnboardingProgress step={d.profile.onboardingStep} />}

      <section aria-labelledby="numbers-title" className="grid gap-4">
        <h2 id="numbers-title" className="sr-only">
          Your numbers
        </h2>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <MetricCard icon={Clock} label="Waiting for your answer" value={d.waiting.length} href="/provider/jobs" tone={d.waiting.length > 0 ? "alert" : "plain"} />
          <MetricCard icon={CalendarCheck} label="Booked" value={d.booked.length} href="/provider/jobs?tab=booked" />
          <MetricCard icon={CircleCheckBig} label="Done" value={d.done.length} href="/provider/jobs?tab=past" />
          <MetricCard
            icon={BadgeCheck}
            label="Checks done"
            value={`${d.checksDone}/${d.checks.length}`}
            href="/provider/checks"
            tone={d.checksDone < d.checks.length ? "alert" : "plain"}
          />
        </div>
      </section>

      <DashboardSection id="next-title" title="Your next job">
        {next ? (
          <ul className="grid">
            <JobCard booking={next} />
          </ul>
        ) : (
          <EmptyState>No booked jobs coming up. When you accept a job, it shows here.</EmptyState>
        )}
      </DashboardSection>

      <DashboardSection
        id="waiting-title"
        title="Waiting for your answer"
        count={d.waiting.length}
        action={
          d.waiting.length > 2 ? (
            <Link href="/provider/jobs" className="font-semibold underline underline-offset-4">
              See all {d.waiting.length}
            </Link>
          ) : null
        }
      >
        {d.waiting.length > 0 ? (
          <ul className="grid gap-4 2xl:grid-cols-2">{d.waiting.slice(0, 2).map((b) => <JobCard key={b.id} booking={b} />)}</ul>
        ) : (
          <EmptyState>
            {d.profile?.status === "approved"
              ? "No jobs waiting. When our team offers you a job, it appears here and we call or text you."
              : "Jobs are offered once your checks are done. See what is left on the Checks page."}
          </EmptyState>
        )}
      </DashboardSection>
    </div>
  );
}

function OnboardingProgress({ step }: { step: number }) {
  const percent = Math.round((Math.min(step, 3) / 3) * 100);
  return (
    <Card variant="tint" className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Briefcase aria-hidden="true" className="mt-1 size-5 shrink-0" strokeWidth={1.5} />
          <div className="grid gap-1">
            <h2 className="text-h4">Finish joining to get jobs</h2>
            <p className="text-text-2">
              {step} of 3 steps done. Tell us your trades, area and registrations, and agree to the checks.
            </p>
          </div>
        </div>
        <Button href="/provider/onboarding">Continue</Button>
      </div>
      <div role="progressbar" aria-label="Joining progress" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} className="h-2.5 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-ink" style={{ width: `${percent}%` }} />
      </div>
    </Card>
  );
}
