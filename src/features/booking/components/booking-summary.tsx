import { CheckList } from "@/components/ui";
import { formatFromPrice } from "@/data/services";
import { describe, type Day, type Draft } from "../draft";

const promises = ["ID and DBS checked", "Insurance checked", "Price agreed before anything is booked", "Pay when the job is done"];

/** Running summary beside the form, so the booking so far is always in view. */
export function BookingSummary({ draft, days }: { draft: Draft; days: Day[] }) {
  const { service, job, day, slot } = describe(draft, days);
  const rows = [
    { label: "Trade", value: service?.name },
    { label: "Job", value: job?.name },
    { label: "Indicative price", value: job ? formatFromPrice(job) : undefined },
    { label: "Postcode", value: draft.postcode.trim() || undefined },
    { label: "When", value: day && slot ? `${day.label}, ${slot.label.toLowerCase()}` : undefined },
  ];

  return (
    <aside aria-labelledby="summary-title" className="grid gap-6 lg:sticky lg:top-6">
      <div className="grid gap-4 rounded-xl border border-line bg-accent-50 p-6">
        <h2 id="summary-title" className="text-h4">
          Your booking
        </h2>
        <dl className="grid gap-3 text-base">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-4">
              <dt className="text-text-3">{row.label}</dt>
              <dd className="text-right font-medium">{row.value ?? "Not chosen yet"}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="grid gap-4 rounded-xl border border-line p-6">
        <h2 className="text-h4">Every booking includes</h2>
        <CheckList items={promises} />
      </div>
    </aside>
  );
}
