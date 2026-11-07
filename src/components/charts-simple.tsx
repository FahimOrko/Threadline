// Flat, token-coloured charts built from plain markup (ADR 0024). Presentational only: every value arrives from the engine; the only maths here is
// mapping a value onto a width or a height (scale), never a derived figure. Each chart is wrapped by ChartFrame, which holds its text alternative.
import Link from "next/link";
import { formatCardValue, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const fmt = (v: number, unit?: string) => `${formatCardValue(v, unit)}${unit && unit !== "%" ? ` ${unit}` : unit === "%" ? "%" : ""}`;
const pct = (v: number, max: number) => `${max === 0 ? 0 : (v / max) * 100}%`;

/** A bar for a value the engine has not got yet: hatched and labelled, never zero (ADR 0016). */
export function HatchedBar({ label = "Needs input" }: { label?: string }) {
  return (
    <div className="flex h-3.5 w-full items-center rounded-sm border border-chart-uncertain" style={{ backgroundImage: "repeating-linear-gradient(135deg, var(--chart-uncertain) 0 1.5px, transparent 1.5px 6px)" }}>
      <span className="sr-only">{label}</span>
    </div>
  );
}

const Label = ({ label, href }: { label: string; href?: string }) =>
  href ? (
    <Link href={href} className="truncate text-sm underline-offset-2 hover:underline focus-visible:underline">
      {label}
    </Link>
  ) : (
    <span className="truncate text-sm">{label}</span>
  );

export type BarRow = { key: string; label: string; value: number | null; href?: string };

/** Horizontal bars on a shared scale. `dashed` outlines the bars (an estimate); a null value is a hatched "Needs input" bar. Row order is the caller's. */
export function BarList({ rows, unit, dashed, valueLabel }: { rows: BarRow[]; unit: string; dashed?: boolean; valueLabel?: (r: BarRow) => string }) {
  const max = Math.max(0, ...rows.map((r) => r.value ?? 0));
  return (
    <ul className="space-y-1.5">
      {rows.map((r) => (
        <li key={r.key} className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_minmax(4rem,auto)] items-center gap-2">
          <Label label={r.label} href={r.href} />
          {r.value === null ? (
            <HatchedBar />
          ) : (
            <div className="h-3.5 w-full rounded-sm bg-muted">
              <div className={cn("h-full rounded-sm", dashed ? "border border-dashed border-chart-subject bg-chart-subject/15" : "bg-chart-subject")} style={{ width: pct(r.value, max) }} />
            </div>
          )}
          <span className="num text-right text-xs text-muted-foreground">{r.value === null ? "Needs input" : (valueLabel?.(r) ?? fmt(r.value, unit))}</span>
        </li>
      ))}
    </ul>
  );
}

/** Utilization per site against the over-allocation cut-off: the bar, a tick at the cut-off and a shaded band below it. Scale is 0 to 100 percent. */
export function BulletList({ rows, cutoff, cutoffLabel, compact }: { rows: BarRow[]; cutoff: number | null; cutoffLabel?: string; compact?: boolean }) {
  return (
    <ul className="space-y-1.5">
      {rows.map((r) => (
        <li key={r.key} className={cn("grid items-center gap-2", compact && cutoffLabel && "pb-4", compact ? "grid-cols-[minmax(0,1fr)_auto]" : "grid-cols-[minmax(0,9rem)_minmax(0,1fr)_3.5rem]")}>
          {!compact && <Label label={r.label} href={r.href} />}
          <div className="relative h-3.5 w-full rounded-sm bg-muted">
            {cutoff !== null && <div aria-hidden className="absolute inset-y-0 left-0 rounded-l-sm bg-foreground/10" style={{ width: `${cutoff}%` }} />}
            {r.value !== null && <div className="absolute inset-y-1 left-0 rounded-sm bg-chart-subject" style={{ width: `${Math.min(100, r.value)}%` }} />}
            {cutoff !== null && (
              <div aria-hidden className="absolute -inset-y-0.5 w-0.5 bg-foreground" style={{ left: `${cutoff}%` }}>
                {compact && cutoffLabel && <span className="absolute top-full left-1/2 mt-0.5 -translate-x-1/2 text-[10px] whitespace-nowrap text-muted-foreground">{cutoffLabel}</span>}
              </div>
            )}
          </div>
          <span className="num text-right text-xs text-muted-foreground">{r.value === null ? "n/a" : fmt(r.value, "%")}</span>
        </li>
      ))}
    </ul>
  );
}

export type PairRow = { key: string; title: string; a: { label: string; value: number }; b: { label: string; value: number }; unit: string; /** An engine figure shown at the end of the row, such as the saved share. */ badge?: string };

/** Two thin bars per row on one scale: `a` the neutral side (the comparison, all sites), `b` the subject (the service, this site). */
export function PairedBars({ rows }: { rows: PairRow[] }) {
  return (
    <ul className="space-y-3">
      {rows.map((r) => {
        const max = Math.max(r.a.value, r.b.value);
        return (
          <li key={r.key} className="space-y-1">
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span>{r.title}</span>
              {r.badge && <span className="num text-xs text-muted-foreground">{r.badge}</span>}
            </div>
            {([
              [r.a, "bg-chart-comparison"],
              [r.b, "bg-chart-subject"],
            ] as const).map(([p, tone]) => (
              <div key={p.label} className="grid grid-cols-[6.5rem_minmax(0,1fr)_minmax(5rem,auto)] items-center gap-2">
                <span className="truncate text-xs text-muted-foreground first-letter:uppercase">{p.label}</span>
                <div className="h-2 w-full rounded-sm bg-muted">
                  <div className={cn("h-full rounded-sm", tone)} style={{ width: pct(p.value, max) }} />
                </div>
                <span className="num text-right text-xs">{fmt(p.value, r.unit)}</span>
              </div>
            ))}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * The net CO2e saving as a direct comparison: one bar for what the comparison would emit, one stacked bar for the service (process, delivery) and the
 * gap between their ends outlined and labelled "Net saving". Values arrive from the engine (the net saving is the engine's, never `comparison - service` here);
 * only the mapping onto a width happens here. Bars share one scale.
 */
export function ComparisonBars({ comparison, service, netSaving, unit }: { comparison: { label: string; value: number }; service: { label: string; process: number; delivery: number; /** The engine's service total. */ total: number }; netSaving: number; unit: string }) {
  const serviceTotal = service.total;
  const max = Math.max(comparison.value, serviceTotal);
  const [from, to] = comparison.value >= serviceTotal ? [serviceTotal, comparison.value] : [comparison.value, serviceTotal];
  return (
    <div data-slot="comparison-bars" className="space-y-3">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground first-letter:uppercase">{comparison.label}</p>
        <div className="flex items-center gap-2">
          <div className="h-6 flex-1 rounded-sm bg-muted">
            <div className="h-full rounded-sm bg-chart-comparison" style={{ width: pct(comparison.value, max) }} />
          </div>
          <span className="num w-28 text-right text-xs">{fmt(comparison.value, unit)}</span>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{service.label}</p>
        <div className="flex items-center gap-2">
          <div className="relative h-6 flex-1 rounded-sm bg-muted">
            <div className="flex h-full overflow-hidden rounded-sm" style={{ width: pct(serviceTotal, max) }}>
              <div className="h-full bg-chart-subject" style={{ width: pct(service.process, serviceTotal) }} />
              <div className="h-full bg-chart-subject/50" style={{ width: pct(service.delivery, serviceTotal) }} />
            </div>
            <div aria-hidden className="absolute inset-y-0 rounded-sm border-2 border-dashed border-foreground/60" style={{ left: pct(from, max), width: pct(to - from, max) }} />
          </div>
          <span className="num w-28 text-right text-xs">{fmt(serviceTotal, unit)}</span>
        </div>
        <p className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 rounded-sm bg-chart-subject" />
            Process <span className="num text-foreground">{fmt(service.process, unit)}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 rounded-sm bg-chart-subject/50" />
            Delivery <span className="num text-foreground">{fmt(service.delivery, unit)}</span>
          </span>
        </p>
      </div>
      <p className="flex items-center gap-2 text-sm">
        <span aria-hidden className="h-3 w-5 rounded-sm border-2 border-dashed border-foreground/60" />
        Net saving <span className="num font-medium">{fmt(netSaving, unit)}</span>
      </p>
    </div>
  );
}

/** Two slices of one whole. Slice sizes are drawn from the engine's parts; labels show the parts themselves, not recomputed shares. */
export function Donut({ parts, center }: { parts: { label: string; value: number; unit: string }[]; center?: { value: string; label: string } }) {
  const total = parts.reduce((a, p) => a + p.value, 0);
  const shares = parts.map((p) => (total === 0 ? 0 : (p.value / total) * 100));
  return (
    <div className="flex items-center gap-4">
      <div className="relative size-28 shrink-0">
        <svg viewBox="0 0 42 42" className="size-full -rotate-90" aria-hidden>
          <circle cx="21" cy="21" r="15.915" fill="none" strokeWidth="5" className="stroke-muted" />
          {parts.map((p, i) => (
            <circle key={p.label} cx="21" cy="21" r="15.915" fill="none" strokeWidth="5" strokeDasharray={`${shares[i]} ${100 - shares[i]}`} strokeDashoffset={-shares.slice(0, i).reduce((a, b) => a + b, 0)} className={i === 0 ? "stroke-chart-subject" : "stroke-chart-comparison"} />
          ))}
        </svg>
        {center && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="num text-sm font-medium">{center.value}</span>
            <span className="text-[10px] text-muted-foreground">{center.label}</span>
          </div>
        )}
      </div>
      <ul className="space-y-1 text-sm">
        {parts.map((p, i) => (
          <li key={p.label} className="flex items-center gap-2">
            <span aria-hidden className={cn("size-2.5 rounded-sm", i === 0 ? "bg-chart-subject" : "bg-chart-comparison")} />
            <span>{p.label}</span>
            <span className="num text-xs text-muted-foreground">{fmt(p.value, p.unit)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** One share as a ring: the arc is value/100 of the circle (a width mapping, no derived figure). Its text alternative is the label and the value. */
export function Ring({ percent, label }: { percent: number; label: string }) {
  const text = `${formatPercent(percent)}%`;
  return (
    <div role="img" aria-label={`${label}: ${text}`} className="relative size-16 shrink-0">
      <svg viewBox="0 0 42 42" className="size-full -rotate-90" aria-hidden>
        <circle cx="21" cy="21" r="15.915" fill="none" strokeWidth="5" className="stroke-muted" />
        <circle cx="21" cy="21" r="15.915" fill="none" strokeWidth="5" pathLength={100} strokeDasharray={`${percent} 100`} className="stroke-chart-subject" />
      </svg>
      <span aria-hidden className="num absolute inset-0 flex items-center justify-center text-xs font-medium">
        {text}
      </span>
    </div>
  );
}

const PART_TONE = ["bg-chart-subject", "bg-chart-subject/55", "bg-chart-comparison", "bg-chart-comparison/45"] as const;

/** Parts of one whole as a single bar, widths proportional to the engine's part values (flex-grow, so no sum is computed here), with a legend. */
export function PartBar({ parts, label }: { parts: { label: string; value: number; unit: string }[]; label: string }) {
  return (
    <div role="img" aria-label={`${label}: ${parts.map((p) => `${p.label} ${fmt(p.value, p.unit)}`).join(", ")}`} className="space-y-1.5">
      <div aria-hidden className="flex h-3 gap-0.5 overflow-hidden rounded-sm">
        {parts.map((p, i) => (
          <div key={p.label} className={PART_TONE[i % PART_TONE.length]} style={{ flex: `${p.value} 1 0` }} />
        ))}
      </div>
      <ul aria-hidden className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
        {parts.map((p, i) => (
          <li key={p.label} className="flex items-center gap-1.5">
            <span className={cn("size-2 rounded-sm", PART_TONE[i % PART_TONE.length])} />
            {p.label} <span className="num text-foreground">{fmt(p.value, p.unit)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A tiny trend line for a tile. Decorative: the tile's trend badge and the main chart carry the same numbers in text. */
export function Sparkline({ values, className }: { values: (number | null)[]; className?: string }) {
  const nums = values.filter((v): v is number => v !== null);
  if (nums.length < 2) return null;
  const [lo, hi] = [Math.min(...nums), Math.max(...nums)];
  const y = (v: number) => (hi === lo ? 12 : 22 - ((v - lo) / (hi - lo)) * 20);
  const pts = values.flatMap((v, i) => (v === null ? [] : [`${(i / (values.length - 1)) * 100},${y(v)}`]));
  return (
    <svg aria-hidden viewBox="0 0 100 24" preserveAspectRatio="none" className={cn("h-6 w-full overflow-visible", className)}>
      <polyline points={pts.join(" ")} fill="none" stroke="var(--chart-subject)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/** Two thin bars, comparison above service, for a tile. Same scale; each labelled with its own value. */
export function CompareBar({ a, b, unit }: { a: { label: string; value: number }; b: { label: string; value: number }; unit: string }) {
  const max = Math.max(a.value, b.value);
  return (
    <div className="space-y-1">
      {([
        [a, "bg-chart-comparison"],
        [b, "bg-chart-subject"],
      ] as const).map(([p, tone]) => (
        <div key={p.label} className="grid grid-cols-[minmax(0,5.5rem)_minmax(0,1fr)] items-center gap-2">
          <span className="truncate text-[11px] text-muted-foreground first-letter:uppercase">{p.label}</span>
          <div className="h-1.5 w-full rounded-sm bg-muted">
            <div className={cn("h-full rounded-sm", tone)} style={{ width: pct(p.value, max) }} />
          </div>
        </div>
      ))}
      <span className="sr-only">
        {a.label}: {fmt(a.value, unit)}. {b.label}: {fmt(b.value, unit)}.
      </span>
    </div>
  );
}

export type StackRow = { key: string; label: string; href?: string; parts: { label: string; value: number }[] };
const STACK_TONE = ["bg-chart-subject/30", "bg-chart-subject/60", "bg-chart-subject"] as const;

/** One stacked bar per row; the parts are non-overlapping counts from the engine. Each part has a direct label in the legend and its count in the row. */
export function StackedBars({ rows, partLabels }: { rows: StackRow[]; partLabels: string[] }) {
  const max = Math.max(0, ...rows.map((r) => r.parts.reduce((a, p) => a + p.value, 0)));
  return (
    <div className="space-y-2">
      <p aria-hidden className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {partLabels.map((l, i) => (
          <span key={l} className="inline-flex items-center gap-1.5">
            <span className={cn("size-2.5 rounded-sm", STACK_TONE[i])} />
            {l}
          </span>
        ))}
      </p>
      <ul className="space-y-1.5">
        {rows.map((r) => {
          const total = r.parts.reduce((a, p) => a + p.value, 0);
          return (
            <li key={r.key} className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_minmax(5rem,auto)] items-center gap-2">
              <Label label={r.label} href={r.href} />
              <div className="flex h-3.5 w-full overflow-hidden rounded-sm bg-muted" style={{ width: pct(total, max) }}>
                {r.parts.map((p, i) => (p.value > 0 ? <div key={p.label} className={cn("h-full", STACK_TONE[i])} style={{ width: pct(p.value, total) }} /> : null))}
              </div>
              <span className="num text-right text-xs text-muted-foreground">{r.parts.map((p) => p.value).join(" / ")}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
