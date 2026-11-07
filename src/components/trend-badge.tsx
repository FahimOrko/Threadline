import type { SeriesTrend } from "@/lib/engine";
import { formatMonthRange, formatMonthSpan, formatPercent } from "@/lib/format";

const WORD = { up: "Up", down: "Down", flat: "Flat" } as const;

/**
 * The change of a figure with its comparison, from the engine's `trend`: a signed percent and the two spans ("+10.3% Oct–Dec vs Jul–Sep"). The sign says
 * which way it moved, never whether that is good, so the style is neutral. It sits on the figure it belongs to; screen readers get the direction in words.
 */
export function TrendBadge({ trend }: { trend: SeriesTrend }) {
  const sign = trend.direction === "up" ? "+" : trend.direction === "down" ? "−" : "";
  const percent = `${sign}${formatPercent(Math.abs(trend.change))}%`;
  return (
    <span data-slot="trend" className="inline-flex flex-wrap items-baseline gap-x-1.5 text-xs text-muted-foreground">
      <span className="sr-only">{`${WORD[trend.direction]} ${percent}, ${formatMonthRange(trend.to)} against ${formatMonthRange(trend.from)}`}</span>
      <span aria-hidden className="num font-medium text-foreground">{percent}</span>
      <span aria-hidden>{`${formatMonthSpan(trend.to)} vs ${formatMonthSpan(trend.from)}`}</span>
    </span>
  );
}
