import Link from "next/link";
import { PRIORITY_LABEL } from "@/components/story-chapter";
import { SEGMENT_GROUP, segmentClass } from "@/lib/segmented-style";
import { PRIORITIES, storyHref, togglePriority, type Priority } from "@/lib/selection";

/** Two-of-six priority chips as plain links: no client state, the picks live in the address (ADR 0019). Each link keeps customer, baseline and sensitivity. */
export function PriorityPicker({ picks, params }: { picks: readonly Priority[]; params: { customer: string; baseline: string; sensitivity: string } }) {
  const labelId = "priority-picker-label";
  return (
    <div className="space-y-2" data-slot="priority-picker">
      <p id={labelId} className="text-sm text-muted-foreground">
        {picks.length < 2 ? "Choose two priorities to lead the story." : "Your two priorities lead the story. Pick another to replace the oldest."}
      </p>
      <ul aria-labelledby={labelId} className={SEGMENT_GROUP}>
        {PRIORITIES.map((p) => {
          const on = picks.includes(p);
          return (
            <li key={p}>
              <Link
                href={storyHref({ ...params, priorities: togglePriority(picks, p) })}
                aria-current={on ? "true" : undefined}
                className={segmentClass(on)}
              >
                {PRIORITY_LABEL[p]}
                {on && <span className="sr-only"> (selected)</span>}
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="max-w-[65ch] text-xs text-muted-foreground">Water and emissions share one chapter, so picking both moves only that chapter.</p>
    </div>
  );
}
