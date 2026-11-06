import {
  ApproximateEquals,
  BookOpen,
  Calculator,
  ChartPieSlice,
  Database,
  PaintBrush,
  PencilSimple,
  Question,
  Ruler,
  UsersThree,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { chipTone, label, type Method, type Source } from "@/lib/provenance";

const methodIcon: Record<Method, Icon> = {
  MEASURED: Ruler,
  CALCULATED: Calculator,
  ALLOCATED: ChartPieSlice,
  ESTIMATED: ApproximateEquals,
  ILLUSTRATIVE: PaintBrush,
  MANUAL_EDIT: PencilSimple,
};

const sourceIcon: Record<Source, Icon> = {
  SYNTHETIC: Database,
  SYNTHETIC_TEAM: UsersThree,
  PUBLIC_REFERENCE: BookOpen,
  ASSUMPTION: Question,
};

export function ProvenanceChip({
  methods,
  source,
  className,
}: {
  methods: Method[];
  source: Source;
  className?: string;
}) {
  const tone = chipTone(methods, source);
  const SourceIcon = sourceIcon[source];
  // Method part and source part wrap onto separate lines when space is tight;
  // each label stays on one line (whitespace-nowrap), so the chip never exceeds its container.
  return (
    <span
      data-tone={tone}
      className={cn(
        "inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-0.5 rounded-2xl border px-2 py-0.5 text-xs",
        tone === "uncertain"
          ? "border-uncertain-foreground/30 bg-uncertain text-uncertain-foreground"
          : "border-certain-foreground/25 bg-certain text-certain-foreground",
        className,
      )}
    >
      <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
        {methods.map((m) => {
          const MethodIcon = methodIcon[m];
          return (
            <span key={m} className="inline-flex items-center gap-1 whitespace-nowrap">
              <MethodIcon aria-hidden size={12} className="shrink-0" />
              {label(m)}
            </span>
          );
        })}
      </span>
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        <SourceIcon aria-hidden size={12} className="shrink-0" />
        {label(source)}
      </span>
    </span>
  );
}
