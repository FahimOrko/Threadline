"use client";

import { CaretRight } from "@phosphor-icons/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type ShowMathProps = {
  formula: string;
  inputs: { label: string; value: string }[];
  assumptionIds: string[];
  baseline: string;
  range: { low: string; base: string; high: string };
};

const triggerClass =
  "inline-flex items-center gap-1 rounded-md text-xs text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50";

function ShowMathBody({ formula, inputs, assumptionIds, baseline, range }: ShowMathProps) {
  return (
    <>
      <p className="num">{formula}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        {inputs.map((i) => (
          <div key={i.label} className="contents">
            <dt className="text-muted-foreground">{i.label}</dt>
            <dd className="num">{i.value}</dd>
          </div>
        ))}
        <dt className="text-muted-foreground">Assumptions</dt>
        <dd className="num">{assumptionIds.join(", ") || "none"}</dd>
        <dt className="text-muted-foreground">Baseline</dt>
        <dd>{baseline}</dd>
        <dt className="text-muted-foreground">Range</dt>
        <dd className="num">
          {range.low} / {range.base} / {range.high}
        </dd>
      </dl>
    </>
  );
}

// The only Show math pattern. It floats, so a card or table never changes size when it opens.
// One open at a time (opening another is an outside press); Esc and an outside press close it.
// The accent thread line is the popup's left border.
export function ShowMathPopover({
  defaultOpen,
  align = "start",
  ...props
}: ShowMathProps & { defaultOpen?: boolean; align?: "start" | "center" | "end" }) {
  // The flex wrapper keeps base-ui's 1px focus-guard spans out of a parent's `space-y` flow, which otherwise grew the card by 3px.
  return (
    <div className="flex">
      <Popover defaultOpen={defaultOpen}>
        <PopoverTrigger className={triggerClass}>
          <CaretRight aria-hidden size={12} />
          Show math
        </PopoverTrigger>
        <PopoverContent align={align} className="w-80 space-y-2 border-l-2 border-l-primary text-left">
          <ShowMathBody {...props} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
