"use client";

import { cn } from "@/lib/cn";

/*
 * An on/off setting. A real button with role="switch", so screen readers say
 * "Larger text, switch, on", and Space or Enter flips it. The visible label
 * also states On or Off in words, not just by colour.
 */
type SwitchProps = {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  tone?: "light" | "dark";
};

export function Switch({ id, label, description, checked, onChange, tone = "light" }: SwitchProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="grid gap-0.5">
        <label htmlFor={id} className="cursor-pointer font-semibold">
          {label}
        </label>
        {description && (
          <p id={`${id}-desc`} className={cn("text-[0.9375rem]", tone === "dark" ? "text-on-ink-2" : "text-text-3")}>
            {description}
          </p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? `${id}-desc` : undefined}
        onClick={() => onChange(!checked)}
        className={cn(
          "inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2.5 rounded-full border-2 px-1.5 pr-3 font-semibold transition-colors",
          checked ? "border-ink bg-ink text-white" : "border-ink bg-white text-ink",
        )}
      >
        <span
          aria-hidden="true"
          className={cn("size-7 rounded-full transition-transform duration-200 motion-reduce:transition-none", checked ? "translate-x-0 bg-accent" : "bg-line")}
        />
        <span aria-hidden="true" className="min-w-[2ch]">{checked ? "On" : "Off"}</span>
      </button>
    </div>
  );
}
