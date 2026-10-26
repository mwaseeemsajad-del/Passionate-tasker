import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

/*
 * FAQ-style accordion built on native <details>, so it works with the
 * keyboard and screen readers without JavaScript. The open/close height is
 * animated in globals.css.
 */

export type AccordionItem = { question: string; answer: string };

export function Accordion({ items, defaultOpen = 0, className }: { items: AccordionItem[]; defaultOpen?: number | null; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-line px-6 py-2 sm:px-8", className)}>
      {items.map((item, i) => (
        <details key={item.question} open={i === defaultOpen} className="group border-b border-line last:border-b-0">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-[22px] text-body font-medium [&::-webkit-details-marker]:hidden">
            {item.question}
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-100 transition-transform duration-350 ease-soft group-open:rotate-180 motion-reduce:transition-none"
            >
              <ChevronDown className="size-4" strokeWidth={2} />
            </span>
          </summary>
          <p className="pr-12 pb-[22px] text-base text-text-3">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
