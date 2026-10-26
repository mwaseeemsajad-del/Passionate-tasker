"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/cn";

/*
 * Pill toggle with a black indicator that slides behind the active option
 * (Design.md: Monthly / Yearly). Controlled: the parent owns the value.
 */

type Option<T extends string> = { value: T; label: string };

type SegmentedToggleProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
};

export function SegmentedToggle<T extends string>({ options, value, onChange, label, className }: SegmentedToggleProps<T>) {
  const layoutId = useId();
  return (
    <div role="group" aria-label={label} className={cn("inline-flex rounded-full border border-line bg-white p-1", className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative min-h-11 cursor-pointer rounded-full px-5 text-base font-medium transition-colors duration-300",
              active ? "text-white" : "text-ink",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-ink"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
