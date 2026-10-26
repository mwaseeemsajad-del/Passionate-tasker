import Link from "next/link";
import { Media } from "@/components/ui";
import type { Guide } from "@/types/content";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

/** Blog-style card: image, date, title, excerpt. The image zooms a little on hover. */
export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <article className="group relative grid content-start gap-3">
      <div className="overflow-hidden rounded-lg">
        <Media alt={guide.photoAlt} src={guide.photo} ratio="3/2" radius="lg" className="transition-transform duration-500 ease-soft group-hover:scale-[1.04] motion-reduce:transition-none" />
      </div>
      <time dateTime={guide.date} className="text-sm text-text-3">
        {dateFormat.format(new Date(guide.date))}
      </time>
      <h3 className="text-h4 transition-colors duration-300 group-hover:text-accent-strong">
        {/* The link covers the whole card; the title is its accessible name. */}
        <Link href={`/#guides`} className="after:absolute after:inset-0">
          {guide.title}
        </Link>
      </h3>
      <p className="text-base text-text-3">{guide.excerpt}</p>
    </article>
  );
}
