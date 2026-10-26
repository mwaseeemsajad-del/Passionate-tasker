import Image from "next/image";
import { cn } from "@/lib/cn";

/*
 * Round avatar. Shows the photo when there is one, otherwise initials.
 * Sample people always use initials so no invented person looks real.
 */
type AvatarProps = { name: string; src?: string; size?: "sm" | "md"; className?: string };

const tints = ["bg-accent-100", "bg-tint-sand", "bg-tint-sky", "bg-tint-rose"];

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const px = size === "md" ? 44 : 36;
  const tint = tints[name.length % tints.length];
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full font-semibold text-ink",
        size === "md" ? "size-11 text-[0.9375rem]" : "size-9 text-[0.8125rem]",
        !src && tint,
        className,
      )}
    >
      {src ? <Image src={src} alt="" width={px} height={px} className="size-full object-cover" /> : <span aria-hidden="true">{initials(name)}</span>}
    </span>
  );
}
