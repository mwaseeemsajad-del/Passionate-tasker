"use client";

import { useState } from "react";
import { SegmentedToggle } from "@/components/ui";
import type { BillingPeriod, Plan } from "@/types/content";
import { PlanCard } from "./plan-card";

const periods: { value: BillingPeriod; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly, save 2 months" },
];

/** The billing toggle and the three plan cards that follow it. */
export function PricingPlans({ plans }: { plans: Plan[] }) {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  return (
    <>
      <div className="mb-12 flex justify-center">
        <SegmentedToggle label="Billing period" options={periods} value={period} onChange={setPeriod} />
      </div>
      <div className="mx-auto grid max-w-[520px] items-start gap-6 lg:max-w-none lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} period={period} />
        ))}
      </div>
    </>
  );
}
