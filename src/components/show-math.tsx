"use client";

import { CaretRight } from "@phosphor-icons/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type ShowMathProps = {
  formula: string;
  /** Short label and value rows. */
  inputs: { label: string; value: string }[];
  /** Long explanatory text: shown full width below the rows, in the sans font. */
  notes?: { label: string; text: string }[];
  assumptionIds: string[];
  baseline: string;
  range: { low: string; base: string; high: string };
};

// Mono is for numbers, formulas and IDs; plain words (names, methods, "not yet modelled") stay sans.
const hasDigit = (v: string) => /\d/.test(v);
const Value = ({ children }: { children: string }) => (
  <dd className={`min-w-0 break-words ${hasDigit(children) ? "num" : ""}`}>
    {children}
  </dd>
);

const triggerClass =
  "inline-flex items-center gap-1 rounded-md text-xs text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50";

function ShowMathBody({
  formula,
  inputs,
  notes = [],
  assumptionIds,
  baseline,
  range,
}: ShowMathProps) {
  return (
    <>
      <p className="num break-words">{formula}</p>
      <dl className="grid grid-cols-[1fr_2fr] gap-x-3 gap-y-1">
        {inputs.map((i) => (
          <div key={i.label} className="contents">
            <dt className="min-w-0 text-muted-foreground">{i.label}</dt>
            <Value>{i.value}</Value>
          </div>
        ))}
        <dt className="min-w-0 text-muted-foreground">Assumptions</dt>
        <dd className="num min-w-0 break-words">
          {assumptionIds.join(", ") || "none"}
        </dd>
        <dt className="min-w-0 text-muted-foreground">Baseline</dt>
        <Value>{baseline}</Value>
        <dt className="min-w-0 text-muted-foreground">Range</dt>
        <dd className="flex min-w-0 flex-wrap gap-x-1.5">
          {[range.low, range.base, range.high].map((v, i) => (
            <span
              key={i}
              className={`whitespace-nowrap ${hasDigit(v) ? "num" : ""}`}
            >
              {v}
              {i < 2 ? " /" : ""}
            </span>
          ))}
        </dd>
      </dl>
      {notes.map((n) => (
        <div
          key={n.label}
          data-slot="show-math-note"
          className="space-y-0.5 border-t pt-2"
        >
          <p className="text-xs text-muted-foreground">{n.label}</p>
          <p className="text-sm">{n.text}</p>
        </div>
      ))}
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
}: ShowMathProps & {
  defaultOpen?: boolean;
  align?: "start" | "center" | "end";
}) {
  // The flex wrapper keeps base-ui's 1px focus-guard spans out of a parent's `space-y` flow, which otherwise grew the card by 3px.
  return (
    <div className="flex">
      <Popover defaultOpen={defaultOpen}>
        <PopoverTrigger className={triggerClass}>
          <CaretRight aria-hidden size={12} />
          Show math
        </PopoverTrigger>
        <PopoverContent
          align={align}
          className="w-[min(30rem,calc(100vw-2rem))] space-y-2 border-l-2 border-l-primary text-left"
        >
          <ShowMathBody {...props} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
