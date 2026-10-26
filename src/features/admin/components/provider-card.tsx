import { ChevronDown, Phone } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { getService } from "@/data/services";
import { checks as checkCopy } from "@/data/trust";
import { accountStatus, checkStatus } from "@/features/accounts/booking-status";
import type { ProviderSummary } from "@/types/accounts";
import { ApproveProviderButton, CheckControl, ProviderStatusControl } from "./controls";

/*
 * One tradesperson for the team. The usual job is one press: Approve, which
 * marks every check as done. Looking at or changing each check, or pausing
 * the account, is folded away under "See each check".
 */
export function ProviderCard({ provider }: { provider: ProviderSummary }) {
  const name = provider.fullName || "Unnamed tradesperson";
  const done = provider.checks.filter((c) => c.status === "approved").length;
  const sent = provider.checks.filter((c) => c.status === "submitted").length;
  return (
    <li>
      <Card className="grid gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1">
            <h3 className="text-h4">{name}</h3>
            <p className="flex flex-wrap items-center gap-x-3 text-[0.9375rem] text-text-3">
              <span className="inline-flex items-center gap-1.5">
                <Phone aria-hidden="true" className="size-4" strokeWidth={1.5} />
                {provider.phone || "No phone"}
              </span>
              <span>{provider.postcode || "No area yet"}</span>
            </p>
          </div>
          <Badge>{accountStatus[provider.status]}</Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          {provider.trades.map((t) => (
            <Badge key={t}>{getService(t)?.name ?? t}</Badge>
          ))}
          {provider.gasSafe && <Badge>Gas Safe {provider.gasSafe}</Badge>}
          {provider.electricalScheme && <Badge>{provider.electricalScheme}</Badge>}
        </div>

        <p className="text-text-2">
          <b>
            {done} of {provider.checks.length} checks done
          </b>
          {sent > 0 && ` · ${sent} sent by them, waiting for you`}
        </p>

        {provider.status !== "approved" && provider.onboardedAt && <ApproveProviderButton providerId={provider.id} name={name} />}
        {!provider.onboardedAt && <p className="text-text-3">Still joining: step {provider.onboardingStep} of 3. Approve once they finish.</p>}

        <details className="group rounded-md border border-line">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 font-medium [&::-webkit-details-marker]:hidden">
            See each check{provider.status === "approved" ? " or pause this account" : ""}
            <ChevronDown aria-hidden="true" className="size-5 transition-transform group-open:rotate-180 motion-reduce:transition-none" strokeWidth={1.5} />
          </summary>
          <div className="grid gap-3 border-t border-line p-4">
            {provider.about && <p className="text-base text-text-2">{provider.about}</p>}
            {provider.checks.map((c) => (
              <CheckControl key={c.id} check={c} title={`${checkCopy.find((x) => x.id === c.kind)?.title ?? c.kind} (${checkStatus[c.status]})`} />
            ))}
            <ProviderStatusControl providerId={provider.id} name={name} status={provider.status} />
          </div>
        </details>
      </Card>
    </li>
  );
}
