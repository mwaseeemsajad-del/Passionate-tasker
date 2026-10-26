import { Avatar } from "@/components/ui";
import type { Review } from "@/types/content";

/** A testimonial in a pale green card (Design.md 6.9). */
export function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="grid gap-4 rounded-lg bg-accent-50 p-[22px]">
      <figcaption className="flex items-center gap-3">
        <Avatar name={review.name} />
        <span>
          <b className="block text-base font-semibold">{review.name}</b>
          <span className="text-sm text-text-3">
            {review.job}, {review.area}
          </span>
        </span>
      </figcaption>
      <blockquote className="text-base text-text-2">“{review.quote}”</blockquote>
    </figure>
  );
}
