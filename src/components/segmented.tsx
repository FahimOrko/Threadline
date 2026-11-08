"use client";

import { Tooltip } from "@/components/tooltip";
import { SEGMENT_GROUP, segmentClass } from "@/lib/segmented-style";
import { cn } from "@/lib/utils";

export type SegmentedOption = { value: string; label: string; /** A plain-language tooltip. */ tip?: string };

/** A row of buttons with every option visible and one checked (a radio group). Used by the scenario strip and the chart toggles. */
export function Segmented({ label, value, options, onChange, hideLabel, className }: { label: string; value: string; options: SegmentedOption[]; onChange: (v: string) => void; hideLabel?: boolean; className?: string }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <span className={cn("shrink-0 text-sm font-medium", hideLabel && "sr-only")}>{label}</span>
      <div role="radiogroup" aria-label={label} className={cn(SEGMENT_GROUP, "flex-nowrap")}>
        {options.map((o) => {
          const on = o.value === value;
          const button = (
            <button
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => !on && onChange(o.value)}
              className={segmentClass(on)}
            >
              {o.label}
            </button>
          );
          return o.tip ? (
            <Tooltip key={o.value} label={o.tip}>
              {button}
            </Tooltip>
          ) : (
            <span key={o.value} className="contents">
              {button}
            </span>
          );
        })}
      </div>
    </div>
  );
}
