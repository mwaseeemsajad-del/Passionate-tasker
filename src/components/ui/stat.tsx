import { CountUp } from "@/components/motion/count-up";
import { cn } from "@/lib/cn";

/*
 * A big number with a small label. Give `value` to count up from 0 when it
 * scrolls into view; give `display` for text that should not count ("7 days").
 */
type StatProps = {
  label: string;
  value?: number;
  suffix?: string;
  display?: string;
  tone?: "light" | "dark";
  className?: string;
};

export function Stat({ label, value, suffix = "", display, tone = "light", className }: StatProps) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <span className="text-stat font-semibold tabular-nums">
        {value !== undefined ? <CountUp to={value} suffix={suffix} /> : display}
      </span>
      <span className={cn("text-base", tone === "dark" ? "text-on-ink-2" : "text-text-3")}>{label}</span>
    </div>
  );
}
