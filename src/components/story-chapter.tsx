import { Badge } from "@/components/badge";
import type { Priority } from "@/lib/selection";

export const PRIORITY_LABEL: Record<Priority, string> = {
  water: "Water",
  cost: "Cost",
  emissions: "Emissions",
  circularity: "Circularity",
  service: "Service",
  hygiene: "Hygiene",
};

/** One chapter of the story. Always fully expanded. A picked chapter carries a "Your priority" badge per pick, in words. */
export function StoryChapter({ id, title, picked = [], lines, children }: { id: string; title: string; picked?: Priority[]; lines: string[]; children?: React.ReactNode }) {
  const headingId = `chapter-${id}`;
  return (
    <section aria-labelledby={headingId} data-slot="story-chapter" className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id={headingId} className="scroll-mt-16 text-base font-medium">
            {title}
          </h2>
          {picked.map((p) => (
            <Badge key={p} variant="accent">
              Your priority: {PRIORITY_LABEL[p]}
            </Badge>
          ))}
        </div>
        {lines.map((line) => (
          <p key={line} className="max-w-[65ch] text-sm">
            {line}
          </p>
        ))}
      </div>
      {children}
    </section>
  );
}
