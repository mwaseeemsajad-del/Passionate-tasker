"use client";

import { AnimatePresence, motion } from "motion/react";
import { Badge, Button, Card, CheckList } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { BillingPeriod, Plan } from "@/types/content";

/** One pricing plan. The featured plan is the ink card, raised above the others (Design.md 6.7). */
export function PlanCard({ plan, period }: { plan: Plan; period: BillingPeriod }) {
  const featured = plan.featured ?? false;
  const amount = plan.price[period];
  const unit = amount === 0 ? "a month" : period === "monthly" ? "a month" : "a year";

  return (
    <Card variant={featured ? "featured" : "tint"} radius="xl" padding="lg" className={cn("relative grid gap-5", featured && "lg:-translate-y-4")}>
      {featured && (
        <Badge tone="white" className="absolute top-6 right-6">
          Most popular
        </Badge>
      )}
      <h3 className={cn("text-base font-normal", featured ? "text-on-ink-2" : "text-text-3")}>{plan.name}</h3>
      <p className="flex items-start gap-1" aria-live="polite">
        <span className="mt-2 text-xl">£</span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={amount}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="text-[3.25rem] leading-none font-semibold tabular-nums"
          >
            {amount}
          </motion.span>
        </AnimatePresence>
        <span className={cn("mb-1.5 ml-1 self-end text-sm", featured ? "text-on-ink-3" : "text-text-3")}>{unit}</span>
      </p>
      <Button href="/book" variant={featured ? "inverse" : "tint"}>
        {plan.ctaLabel}
      </Button>
      <p className={cn("text-[0.9375rem]", featured ? "text-on-ink-3" : "text-text-3")}>{plan.featuresIntro}</p>
      <CheckList items={plan.features} tone={featured ? "dark" : "light"} />
    </Card>
  );
}
