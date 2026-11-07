import { factShowMath } from "@/components/fact-stat-card";
import { FadeIn } from "@/components/fade-in";
import { Panel } from "@/components/panel";
import { ShowMathPopover, type ShowMathProps } from "@/components/show-math";
import type { Fact } from "@/lib/engine";
import { formatCardValue, formatMonth } from "@/lib/format";
import { cn } from "@/lib/utils";

export type ChartTable = { caption: string; head: string[]; rows: (string | number)[][] };

/**
 * Every chart's frame (ADR 0024): the question as its title, a one-line caption, Show math for its series, a one-sentence summary and the same
 * numbers as a visually hidden table. The chart is a labelled group named by the summary; the hidden table is the text alternative (a chart that is itself a table, like the heatmap, omits it).
 */
export function ChartFrame({ title, caption, summary, table, math, children, className, fade = true }: { title: string; caption?: string; summary: string; table?: ChartTable; math?: ShowMathProps; children: React.ReactNode; className?: string; fade?: boolean }) {
  const body = (
    <Panel data-slot="chart-frame" className={cn("space-y-3", className)}>
      <div className="space-y-0.5">
        <h3 className="text-sm font-medium">{title}</h3>
        {caption && <p className="text-xs text-muted-foreground">{caption}</p>}
      </div>
      <div role="group" aria-label={summary}>
        {children}
      </div>
      {table && (
      // The wrapper clips: a table element ignores sr-only's 1px box and would widen the page.
      <div className="sr-only">
      <table>
        <caption>{table.caption}</caption>
        <thead>
          <tr>
            {table.head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      )}
      {math && <ShowMathPopover {...math} />}
    </Panel>
  );
  return fade ? <FadeIn>{body}</FadeIn> : body;
}

/** The hidden table for series on one set of months: a row per month, a column per series, values as the cards print them. */
export function seriesTable(caption: string, series: { label: string; unit: string; points: { month: string; value: number | null }[] }[]): ChartTable {
  return {
    caption,
    head: ["Month", ...series.map((s) => `${s.label} (${s.unit})`)],
    rows: series[0].points.map((p, i) => [formatMonth(p.month, true), ...series.map((s) => (s.points[i].value === null ? "Needs input" : formatCardValue(s.points[i].value!, s.unit)))]),
  };
}

/** Show math for a monthly series: the Fact's own rows, with the formula saying the same rule runs one month at a time. A series without a Fact has none. */
export const seriesMath = (fact: Fact | null): ShowMathProps | undefined => (fact ? { ...factShowMath(fact), formula: `${fact.formula}. Each month applies the same formula to that month alone.` } : undefined);
