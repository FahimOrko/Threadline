import { ArrowDown, ArrowUp, Minus } from "@phosphor-icons/react/ssr";
import { Tooltip } from "@/components/tooltip";
import type { SeriesTrend } from "@/lib/engine";
import { formatMonthRange, formatPercent } from "@/lib/format";

const ICON = { up: ArrowUp, down: ArrowDown, flat: Minus } as const;
const WORD = { up: "Up", down: "Down", flat: "Flat" } as const;

/**
 * Direction and size of a change, from the engine's `trend`. A word, a glyph and a signed percent in one neutral style: it says which way a figure
 * moved, never whether that is good (more dormant sites is bad, more avoided cost is good). The tooltip names the exact periods compared.
 */
export function TrendBadge({ trend }: { trend: SeriesTrend }) {
  const Icon = ICON[trend.direction];
  const sign = trend.direction === "up" ? "+" : trend.direction === "down" ? "−" : "";
  const percent = `${sign}${formatPercent(Math.abs(trend.change))}%`;
  const period = `${formatMonthRange(trend.to)} against ${formatMonthRange(trend.from)}`;
  return (
    <Tooltip label={period}>
      <span tabIndex={0} aria-label={`${WORD[trend.direction]} ${percent}, ${period}`} className="inline-flex cursor-default items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Icon aria-hidden size={12} />
        <span aria-hidden>{WORD[trend.direction]}</span>
        <span aria-hidden className="num">
          {percent}
        </span>
      </span>
    </Tooltip>
  );
}
