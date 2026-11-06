"use client";

import { useId, useState } from "react";
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

// The thread: a teal line runs from the trigger down the open panel. Expands inline (cards).
export function ShowMath(props: ShowMathProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)} className={triggerClass}>
        <CaretRight aria-hidden size={12} className={open ? "rotate-90" : ""} />
        Show math
      </button>
      {open && (
        <div id={id} className="mt-2 space-y-2 border-l-2 border-primary pl-3 text-sm">
          <ShowMathBody {...props} />
        </div>
      )}
    </div>
  );
}

// Same content as a popover, for table headers: it floats, so the table layout never changes.
// One open at a time (opening another is an outside press), Esc and outside press close it.
export function ShowMathPopover({ defaultOpen, ...props }: ShowMathProps & { defaultOpen?: boolean }) {
  return (
    <Popover defaultOpen={defaultOpen}>
      <PopoverTrigger className={triggerClass}>
        <CaretRight aria-hidden size={12} />
        Show math
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-2 border-l-2 border-l-primary text-left">
        <ShowMathBody {...props} />
      </PopoverContent>
    </Popover>
  );
}
