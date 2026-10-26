import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
 * The signature pill button (Design.md section 4).
 *
 * - primary:   ink pill, white arrow badge. Use on light sections.
 * - secondary: white pill, ink badge with a green arrow. Use on dark sections and over photos.
 * - tint:      full-width green-tint pill, no arrow. Pricing cards.
 * - inverse:   full-width white pill, no arrow. Inside dark cards.
 *
 * Pass `href` to render a link, or leave it out to render a <button>.
 */

type Variant = "primary" | "secondary" | "tint" | "inverse";

const base =
  "group/btn inline-flex min-h-11 cursor-pointer items-center rounded-full font-medium text-base leading-none transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "gap-4 bg-ink py-1 pr-1 pl-[18px] text-white",
  secondary: "gap-4 bg-white py-1 pr-1 pl-[18px] text-ink ring-1 ring-white/35",
  tint: "w-full justify-center bg-accent-100 px-5 py-3.5 text-ink hover:bg-accent",
  inverse: "w-full justify-center bg-white px-5 py-3.5 text-ink hover:bg-accent-100",
};

const hasArrow = (v: Variant) => v === "primary" || v === "secondary";

function Label({ children, roll }: { children: ReactNode; roll: boolean }) {
  if (!roll) return <span>{children}</span>;
  // Two stacked copies; on hover both slide up one line (the "text roll").
  return (
    <span className="relative block h-[1.5em] overflow-hidden leading-[1.5em]">
      <span className="block transition-transform duration-350 ease-soft group-hover/btn:-translate-y-full motion-reduce:transition-none">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute top-full left-0 block transition-transform duration-350 ease-soft group-hover/btn:-translate-y-full motion-reduce:transition-none"
      >
        {children}
      </span>
    </span>
  );
}

function ArrowBadge({ variant }: { variant: Variant }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-9 shrink-0 place-items-center overflow-hidden rounded-full",
        variant === "primary" ? "bg-white text-ink" : "bg-ink text-accent",
      )}
    >
      <ArrowRight
        className="size-[18px] transition-transform duration-350 ease-soft group-hover/btn:translate-x-[3px] motion-reduce:transition-none"
        strokeWidth={1.6}
      />
    </span>
  );
}

type CommonProps = { variant?: Variant; className?: string; children: ReactNode };
type LinkButtonProps = CommonProps & Omit<ComponentProps<typeof Link>, "className" | "children"> & { href: string };
type NativeButtonProps = CommonProps & Omit<ComponentProps<"button">, "className" | "children"> & { href?: undefined };

export type ButtonProps = LinkButtonProps | NativeButtonProps;

export function Button({ variant = "primary", className, children, ...rest }: ButtonProps) {
  const arrow = hasArrow(variant);
  const classes = cn(base, variants[variant], className);
  const inner = (
    <>
      <Label roll={arrow}>{children}</Label>
      {arrow && <ArrowBadge variant={variant} />}
    </>
  );

  if (rest.href !== undefined) {
    return (
      <Link {...(rest as Omit<LinkButtonProps, keyof CommonProps>)} className={classes}>
        {inner}
      </Link>
    );
  }

  const buttonProps = rest as Omit<NativeButtonProps, keyof CommonProps>;
  return (
    <button {...buttonProps} type={buttonProps.type ?? "button"} className={classes}>
      {inner}
    </button>
  );
}
