"use client";

import { useEffect, useState } from "react";
import { ChoiceGroup } from "@/components/ui";
import type { Trade } from "@/types/content";
import { listProviders, type ProviderOption } from "../providers";

/*
 * "Who would you like to come?" Letting us choose is first and selected by
 * default: it is the quickest, and it is what voice booking always does.
 * Below it, the approved tradespeople for this trade, nearest first.
 * A tradesperson's choice is remembered only if they are still on the list.
 */
export function ProviderPicker({ trade, postcode, value, onChange }: { trade: Trade | ""; postcode: string; value: string; onChange: (id: string, name: string) => void }) {
  const [options, setOptions] = useState<ProviderOption[] | null>(null);

  useEffect(() => {
    if (!trade) return;
    let alive = true;
    listProviders(trade, postcode)
      .then((list) => {
        if (!alive) return;
        setOptions(list);
        if (value && !list.some((p) => p.id === value)) onChange("", "");
      })
      .catch(() => alive && setOptions([]));
    return () => {
      alive = false;
    };
    // Only refetch when the trade or area changes; `value` and `onChange` are read once per fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trade, postcode]);

  const choices = [
    { value: "", label: "Let us choose for me", detail: "We send the nearest checked tradesperson who is free. This is the quickest." },
    ...(options ?? []).map((p) => ({
      value: p.id,
      label: p.name,
      detail: [p.area && `${p.area} area`, `${p.jobsDone} ${p.jobsDone === 1 ? "job" : "jobs"} done with us`, p.registered, p.about].filter(Boolean).join(" · "),
    })),
  ];

  return (
    <div className="grid gap-3">
      <ChoiceGroup
        name="provider"
        legend="Who would you like to come?"
        hint={
          options === null
            ? "Finding checked tradespeople near you…"
            : options.length === 0
              ? "We will choose a checked tradesperson near you."
              : "Every tradesperson here has passed our checks. If the one you choose cannot come, we offer the job to the next nearest."
        }
        columns={1}
        choices={choices}
        value={value}
        onChange={(id) => onChange(id, options?.find((p) => p.id === id)?.name ?? "")}
      />
    </div>
  );
}
