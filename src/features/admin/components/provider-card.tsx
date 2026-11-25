import { ChevronDown, FileText, Phone } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { getService } from "@/data/services";
import { checks as checkCopy } from "@/data/trust";
import { BUSINESS_TYPES, DAYS } from "@/features/provider/onboarding";
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

        <dl className="grid gap-1 text-[0.9375rem] text-text-2 sm:grid-cols-[140px_1fr]">
          <dt className="text-text-3">Business</dt>
          <dd>
            {[BUSINESS_TYPES.find((b) => b.value === provider.businessType)?.label ?? "Not given", provider.businessName, provider.companyNumber && `Companies House ${provider.companyNumber}`]
              .filter(Boolean)
              .join(" · ")}
          </dd>
          <dt className="text-text-3">Address</dt>
          <dd>{provider.businessAddress || "Not given"}</dd>
          <dt className="text-text-3">Works</dt>
          <dd>
            {provider.availableDays.length === 7 ? "Every day" : provider.availableDays.map((d) => DAYS[d - 1].slice(0, 3)).join(", ")} · {provider.availableSlots.join(", ")}
          </dd>
          <dt className="text-text-3">Languages</dt>
          <dd>{provider.languages.join(", ")}</dd>
        </dl>

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
              <div key={c.id} className="grid gap-2">
                <CheckControl check={c} title={`${checkCopy.find((x) => x.id === c.kind)?.title ?? c.kind} (${checkStatus[c.status]})`} />
                {c.documents.length > 0 ? (
                  <ul className="grid gap-1 pl-1 text-[0.9375rem]">
                    {c.documents.map((d) => (
                      <li key={d.path} className="flex items-center gap-2">
                        <FileText aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.5} />
                        <a href={`/documents?path=${encodeURIComponent(d.path)}`} target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">
                          {d.fileName}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                        <span className="text-text-3">{new Date(d.uploadedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="pl-1 text-[0.9375rem] text-text-3">No document uploaded.</p>
                )}
              </div>
            ))}
            <ProviderStatusControl providerId={provider.id} name={name} status={provider.status} />
            <div className="grid gap-2 border-t border-line pt-3">
              <h4 className="font-semibold">History</h4>
              {provider.history.length === 0 ? (
                <p className="text-[0.9375rem] text-text-3">No changes yet.</p>
              ) : (
                <ul className="grid gap-1 text-[0.9375rem] text-text-2">
                  {provider.history.map((h, i) => (
                    <li key={i}>
                      <span className="text-text-3">
                        {new Date(h.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" })}
                      </span>{" "}
                      · {h.actorName}: {h.action.replace(/_/g, " ")}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </details>
      </Card>
    </li>
  );
}
