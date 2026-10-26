import Image from "next/image";
import { cn } from "@/lib/cn";

/*
 * A rounded image frame. Until real photos exist, leave out `src` and the
 * frame shows a soft placeholder that names the photo it is waiting for, so
 * the layout is final and swapping in the photo is a one-prop change.
 */

type Ratio = "4/5" | "3/4" | "16/9" | "3/2" | "5/4" | "1/1";
type MediaProps = {
  /** What the photo shows. Used as alt text, and as the placeholder caption. */
  alt: string;
  src?: string;
  ratio?: Ratio;
  radius?: "lg" | "xl";
  tone?: "light" | "dark";
  sizes?: string;
  priority?: boolean;
  className?: string;
};

const ratios: Record<Ratio, string> = {
  "4/5": "aspect-[4/5]",
  "3/4": "aspect-[3/4]",
  "16/9": "aspect-video",
  "3/2": "aspect-[3/2]",
  "5/4": "aspect-[5/4]",
  "1/1": "aspect-square",
};

export function Media({ alt, src, ratio = "4/5", radius = "xl", tone = "light", sizes = "(min-width: 992px) 50vw, 100vw", priority, className }: MediaProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        ratios[ratio],
        radius === "lg" ? "rounded-lg" : "rounded-xl",
        !src &&
          (tone === "light"
            ? "bg-linear-to-br from-accent-50 via-mist to-sage"
            : "bg-linear-to-br from-moss to-moss-deep"),
        className,
      )}
    >
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <span
          role="img"
          aria-label={alt}
          className={cn("absolute inset-x-5 bottom-5 text-sm", tone === "light" ? "text-text-3" : "text-on-ink-3")}
        >
          Photo: {alt}
        </span>
      )}
    </div>
  );
}
