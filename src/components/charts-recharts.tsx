"use client";

// The two Recharts charts (ADR 0024): the Overview's interactive area chart and the thread line. Colours are theme tokens, there is no
// chart animation, and every number comes from the engine; slicing to the last 3, 6 or 12 points is selection.
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from "recharts";
import { Segmented } from "@/components/segmented";
import { ShowMathPopover, type ShowMathProps } from "@/components/show-math";
import { formatCardValue, formatMonth, formatMonthRange } from "@/lib/format";
import type { MonthlySeries, WindowMonths } from "@/lib/engine";

const compact = (v: number) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(v);
const axis = { stroke: "var(--chart-grid)", tick: { fill: "var(--muted-foreground)", fontSize: 11 }, tickLine: false } as const;
const unitText = (v: number, unit: string) => `${formatCardValue(v, unit)}${unit === "%" ? "%" : ` ${unit}`}`;

type Row = { month: string; value: number | null };
function Tip({ active, payload, unit }: { active?: boolean; payload?: { payload: Row }[]; unit: string }) {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  return (
    <div className="rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground">
      <div className="text-muted-foreground">{formatMonth(row.month, true)}</div>
      <div className="num">{row.value === null ? "Needs input" : unitText(row.value, unit)}</div>
    </div>
  );
}

export type AreaMeasure = { id: string; label: string; /** Show math for the measure shown. */ math?: ShowMathProps; series: Pick<MonthlySeries, "points" | "windows" | "unit"> & { /** An estimate or illustrative figure draws dashed. */ dashed: boolean } };

/** One measure over the year, with a measure toggle and a 3, 6 or 12 month range toggle. The total beside the chart is the engine's window value. */
export function AreaChartInteractive({ measures, defaultId }: { measures: AreaMeasure[]; defaultId?: string }) {
  const [id, setId] = useState(defaultId ?? measures[0].id);
  const [range, setRange] = useState<WindowMonths>(12);
  const m = measures.find((x) => x.id === id) ?? measures[0];
  const { points, windows, unit, dashed } = m.series;
  const shown = points.slice(-range);
  const win = windows[range];
  const snapshot = unit === "%";
  const last = shown[shown.length - 1];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Segmented label="Measure" hideLabel value={m.id} onChange={setId} options={measures.map((x) => ({ value: x.id, label: x.label }))} />
        <Segmented label="Range" hideLabel value={String(range)} onChange={(v) => setRange(Number(v) as WindowMonths)} options={([3, 6, 12] as const).map((n) => ({ value: String(n), label: `${n} months` }))} />
      </div>
      {win && (
        <p className="text-sm">
          <span className="text-muted-foreground">{snapshot ? `${formatMonth(win.to, true)}: ` : `${formatMonthRange({ from: win.from, to: win.to })}: `}</span>
          <span className="num font-medium">{win.value === null ? "Needs input" : unitText(win.value, unit)}</span>
        </p>
      )}
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 640, height: 224 }}>
          <AreaChart data={shown} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
            <XAxis dataKey="month" tickFormatter={(v: string) => formatMonth(v)} {...axis} />
            <YAxis width={44} tickFormatter={compact} {...axis} axisLine={false} />
            <ChartTooltip cursor={{ stroke: "var(--chart-grid)" }} content={<Tip unit={unit} />} />
            <Area type="monotone" dataKey="value" stroke="var(--chart-subject)" strokeWidth={1.5} strokeDasharray={dashed ? "5 4" : undefined} fill="var(--chart-subject)" fillOpacity={0.12} isAnimationActive={false} dot={false} />
            {last && last.value !== null && <ReferenceDot x={last.month} y={last.value} r={3.5} fill="var(--chart-subject)" stroke="var(--background)" ifOverflow="visible" />}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {m.math && <ShowMathPopover {...m.math} />}
    </div>
  );
}

export type ThreadPoint = { month: string; value: number | null; /** The spike rule's line for the month; absent before it has history. */ threshold?: number | null };

/** The thread: one thin line with an end node. `threshold` draws the spike line dashed; `marks` label months the engine flagged. */
export function ThreadLine({ points, unit, dashed, marks = [], height = 176 }: { points: ThreadPoint[]; unit: string; dashed?: boolean; marks?: { month: string; label: string }[]; height?: number }) {
  const hasThreshold = points.some((p) => p.threshold != null);
  const last = points[points.length - 1];
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 480, height }}>
        <LineChart data={points} margin={{ top: 16, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis dataKey="month" tickFormatter={(v: string) => formatMonth(v)} {...axis} interval="preserveStartEnd" />
          <YAxis width={40} tickFormatter={compact} {...axis} axisLine={false} />
          <ChartTooltip cursor={{ stroke: "var(--chart-grid)" }} content={<Tip unit={unit} />} />
          {hasThreshold && <Line type="monotone" dataKey="threshold" stroke="var(--chart-comparison)" strokeWidth={1} strokeDasharray="3 3" dot={false} isAnimationActive={false} connectNulls={false} />}
          <Line type="monotone" dataKey="value" stroke="var(--chart-subject)" strokeWidth={1.5} strokeDasharray={dashed ? "5 4" : undefined} dot={false} isAnimationActive={false} />
          {marks.map((k) => {
            const p = points.find((x) => x.month === k.month);
            return p && p.value !== null ? <ReferenceDot key={k.month} x={k.month} y={p.value} r={4} fill="var(--chart-subject)" stroke="var(--background)" label={{ value: k.label, position: "top", fill: "var(--foreground)", fontSize: 11 }} ifOverflow="visible" /> : null;
          })}
          {last && last.value !== null && <ReferenceDot x={last.month} y={last.value} r={3} fill="var(--chart-subject)" stroke="var(--background)" ifOverflow="visible" />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
