/*
 * Numbered steps of a multi-step form, with the current one marked for
 * screen readers (aria-current="step") and finished ones said as "done".
 */
export function StepProgress({ steps, current, label }: { steps: readonly string[]; current: number; label: string }) {
  return (
    <ol className="flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem]" aria-label={label}>
      {steps.map((step, i) => (
        <li key={step} aria-current={i === current ? "step" : undefined} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={
              i < current
                ? "grid size-7 place-items-center rounded-full bg-accent-100 text-sm font-semibold"
                : i === current
                  ? "grid size-7 place-items-center rounded-full bg-ink text-sm font-semibold text-white"
                  : "grid size-7 place-items-center rounded-full border border-line text-sm text-text-3"
            }
          >
            {i + 1}
          </span>
          <span className={i === current ? "font-semibold" : "text-text-3"}>
            {step}
            {i < current && <span className="sr-only"> (done)</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}
