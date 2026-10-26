import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
 * Accessible form building blocks. Every field has a visible label, an
 * optional hint, and an error that is linked to the input with
 * aria-describedby, so a screen reader reads label, hint and error together.
 * Inputs are 18px with 52px targets, large enough for older users.
 */

const control =
  "w-full rounded-md border border-line bg-white px-4 py-3 text-body text-ink placeholder:text-text-3 transition-colors focus:border-ink focus:outline-2 focus:outline-offset-0 focus:outline-ink aria-invalid:border-danger";

type FieldShellProps = { id: string; label: string; hint?: string; error?: string; optional?: boolean; children: ReactNode; className?: string };

export const describedBy = (id: string, hint?: string, error?: string) =>
  [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;

function FieldShell({ id, label, hint, error, optional, children, className }: FieldShellProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <label htmlFor={id} className="text-base font-semibold">
        {label}
        {optional && <span className="font-normal text-text-3"> (optional)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="-mt-1 text-[0.9375rem] text-text-3">
          {hint}
        </p>
      )}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
      {children}
    </div>
  );
}

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="text-[0.9375rem] font-semibold text-danger">
      <span className="sr-only">Error: </span>
      {children}
    </p>
  );
}

type TextFieldProps = Omit<ComponentProps<"input">, "id"> & { id: string; label: string; hint?: string; error?: string; optional?: boolean };

export function TextField({ id, label, hint, error, optional, className, ...props }: TextFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <input id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, hint, error)} className={control} {...props} />
    </FieldShell>
  );
}

type TextAreaFieldProps = Omit<ComponentProps<"textarea">, "id"> & { id: string; label: string; hint?: string; error?: string; optional?: boolean };

export function TextAreaField({ id, label, hint, error, optional, className, rows = 4, ...props }: TextAreaFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <textarea id={id} rows={rows} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, hint, error)} className={cn(control, "resize-y")} {...props} />
    </FieldShell>
  );
}

/*
 * A group of large radio cards inside a fieldset. Arrow keys move between
 * options (native radio behaviour); the whole card is the click target.
 */
export type Choice = { value: string; label: string; detail?: string };

type ChoiceGroupProps = {
  name: string;
  legend: string;
  hint?: string;
  error?: string;
  choices: Choice[];
  value: string;
  onChange: (value: string) => void;
  columns?: 1 | 2 | 3;
  className?: string;
};

export function ChoiceGroup({ name, legend, hint, error, choices, value, onChange, columns = 2, className }: ChoiceGroupProps) {
  const id = `${name}-group`;
  return (
    <fieldset id={id} aria-describedby={describedBy(id, hint, error)} className={cn("grid gap-3", className)}>
      <legend className="mb-2 text-base font-semibold">{legend}</legend>
      {hint && (
        <p id={`${id}-hint`} className="-mt-2 text-[0.9375rem] text-text-3">
          {hint}
        </p>
      )}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
      <div className={cn("grid gap-3", columns === 2 && "sm:grid-cols-2", columns === 3 && "sm:grid-cols-2 lg:grid-cols-3")}>
        {choices.map((choice) => {
          const checked = choice.value === value;
          const optionId = `${name}-${choice.value}`;
          return (
            <label
              key={choice.value}
              htmlFor={optionId}
              className={cn(
                "flex min-h-14 cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink",
                checked ? "border-ink bg-accent-50" : "border-line bg-white hover:border-text-3",
              )}
            >
              <input
                id={optionId}
                type="radio"
                name={name}
                value={choice.value}
                checked={checked}
                onChange={() => onChange(choice.value)}
                className="mt-1 size-5 shrink-0 accent-ink focus-visible:outline-none"
              />
              <span className="grid gap-0.5">
                <span className="font-medium">{choice.label}</span>
                {choice.detail && <span className="text-[0.9375rem] text-text-3">{choice.detail}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/*
 * Listed at the top of a step when it has errors. It takes focus, so a screen
 * reader announces the problems, and each one links to its field.
 */
export function ErrorSummary({ errors, ref }: { errors: { id: string; message: string }[]; ref?: React.Ref<HTMLDivElement> }) {
  if (errors.length === 0) return null;
  return (
    <div ref={ref} tabIndex={-1} role="alert" aria-labelledby="error-summary-title" className="rounded-lg border-2 border-danger bg-white p-5">
      <h2 id="error-summary-title" className="text-h4">
        There {errors.length === 1 ? "is a problem" : `are ${errors.length} problems`}
      </h2>
      <ul className="mt-2 grid gap-1">
        {errors.map((e) => (
          <li key={e.id}>
            <a href={`#${e.id}`} className="font-semibold text-danger underline underline-offset-4">
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
