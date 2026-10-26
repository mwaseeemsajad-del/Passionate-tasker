import { Card, IconCircle } from "@/components/ui";
import type { Feature } from "@/types/content";

/** Icon, title and two lines of copy in a hairline card (Design.md 6.4). */
export function FeatureCard({ feature, tinted = false }: { feature: Feature; tinted?: boolean }) {
  return (
    <Card variant={tinted ? "tint" : "plain"} className="grid grid-cols-[40px_1fr] gap-x-4 gap-y-1.5">
      <IconCircle icon={feature.icon} className="row-span-2" />
      <h3 className="text-h3">{feature.title}</h3>
      <p className="text-base text-text-3">{feature.body}</p>
    </Card>
  );
}
