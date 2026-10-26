import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Centred 1200px content column with the Design.md side gutters (16 → 24 → 32 → 48px). */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[calc(1200px+6rem)] px-4 sm:px-6 md:px-8 lg:px-12", className)}
      {...props}
    />
  );
}
