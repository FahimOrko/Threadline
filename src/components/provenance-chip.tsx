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
import { Tooltip } from "@/components/tooltip";
import { cn } from "@/lib/utils";
import { chipTone, label, UNCERTAIN_METHODS, type Method, type Source } from "@/lib/provenance";

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
  compact = false,
  variant,
}: {
  methods: Method[];
  source: Source;
  className?: string;
  /** Method glyphs only; the full text is the accessible name and the tooltip (shown on hover and focus). */
  compact?: boolean;
  /** `label`: one line with the least certain method's glyph and word, "+N" for more methods and the source's mark; the full text is the name and the tooltip. */
  variant?: "label";
}) {
  const tone = chipTone(methods, source);
  const toneClasses =
    tone === "uncertain"
      ? "border-uncertain-foreground/30 bg-uncertain text-uncertain-foreground"
      : "border-certain-foreground/25 bg-certain text-certain-foreground";
  if (variant === "label") {
    const text = `${methods.map(label).join(", ")}, ${label(source)}`;
    const main = methods.find((m) => UNCERTAIN_METHODS.has(m)) ?? methods[0];
    const MainIcon = methodIcon[main];
    const Src = sourceIcon[source];
    return (
      <Tooltip label={text}>
        <button
          type="button"
          data-tone={tone}
          data-variant="label"
          aria-label={text}
          className={cn("inline-flex max-w-full cursor-default flex-nowrap items-center gap-1.5 rounded-2xl border px-2 py-0.5 text-xs whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-ring/50", toneClasses, className)}
        >
          <MainIcon aria-hidden size={12} className="shrink-0" />
          <span aria-hidden>{label(main)}</span>
          {methods.length > 1 && <span aria-hidden>+{methods.length - 1}</span>}
          <Src aria-hidden size={12} className="shrink-0" />
        </button>
      </Tooltip>
    );
  }
  if (compact) {
    const text = `${methods.map(label).join(", ")}, ${label(source)}`;
    return (
      <Tooltip label={text}>
        <button
          type="button"
          data-tone={tone}
          data-compact
          aria-label={text}
          className={cn(
            "inline-flex cursor-default items-center gap-1 rounded-2xl border px-1.5 py-0.5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            toneClasses,
            className,
          )}
        >
          {methods.map((m) => {
            const MethodIcon = methodIcon[m];
            return <MethodIcon key={m} aria-hidden size={14} className="shrink-0" />;
          })}
        </button>
      </Tooltip>
    );
  }
  const SourceIcon = sourceIcon[source];
  // Method part and source part wrap onto separate lines when space is tight;
  // each label stays on one line (whitespace-nowrap), so the chip never exceeds its container.
  return (
    <span
      data-tone={tone}
      className={cn(
        "inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-0.5 rounded-2xl border px-2 py-0.5 text-xs",
        toneClasses,
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

/** One line per page that explains the chip's glyphs (the least certain method's word, "+N" for more, and the source mark). */
export function ChipLegend({ methods, sources }: { methods: readonly Method[]; sources: readonly Source[] }) {
  return (
    <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <span className="font-medium">Chips show how a figure was made:</span>
      {methods.map((m) => {
        const Icon = methodIcon[m];
        return (
          <span key={m} className="inline-flex items-center gap-1">
            <Icon aria-hidden size={12} />
            {label(m)}
          </span>
        );
      })}
      <span aria-hidden>·</span>
      {sources.map((src) => {
        const Icon = sourceIcon[src];
        return (
          <span key={src} className="inline-flex items-center gap-1">
            <Icon aria-hidden size={12} />
            {label(src)}
          </span>
        );
      })}
      <span>+N means more methods; hover a chip for all of them.</span>
    </p>
  );
}
