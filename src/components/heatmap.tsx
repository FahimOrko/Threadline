"use client";

import Link from "next/link";
import { useState } from "react";
import { ChartFrame } from "@/components/chart-frame";
import { Segmented } from "@/components/segmented";
import { formatCardValue, formatMonth } from "@/lib/format";
import type { SiteMatrix } from "@/lib/engine";
import { siteHref } from "@/lib/selection";

/** What the frame says for one measure: the question, a caption naming the period, the "i" text and the legend (what a highlighted cell means). All resolved by the page. */
export type HeatmapFrame = { title: string; caption: string; summary: string; explain: string; legend: string };

/**
 * Sites by month with a measure toggle (ADR 0024, 0028). Cells are neutral; only a cell the engine marks `highlight` is coloured, and it also carries a mark
 * and the word "highlighted" so colour is never the only signal. Rows arrive in the order to show (most highlighted months first). It is a real table:
 * each cell holds its value as text and as a tooltip.
 */
export function Heatmap({ matrices, frames, link }: { matrices: SiteMatrix[]; frames: Record<SiteMatrix["measure"], HeatmapFrame>; /** The params a site link keeps; without them the names are plain text. */ link?: { customer: string; baseline: string; sensitivity: string } }) {
  const [measure, setMeasure] = useState(matrices[0].measure);
  const m = matrices.find((x) => x.measure === measure) ?? matrices[0];
  const f = frames[m.measure];
  return (
    <ChartFrame title={f.title} caption={f.caption} summary={f.summary} explain={f.explain}>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Segmented label="Measure" hideLabel value={m.measure} onChange={(v) => setMeasure(v as typeof measure)} options={matrices.map((x) => ({ value: x.measure, label: x.label }))} />
          <p className="flex max-w-[48ch] items-start gap-1.5 text-xs text-muted-foreground">
            <span aria-hidden className="mt-0.5 flex size-3 shrink-0 items-center justify-center rounded-sm bg-chart-flag">
              <span className="size-1 rounded-full bg-background" />
            </span>
            {f.legend}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-separate border-spacing-0.5 text-xs">
            <caption className="sr-only">
              {m.label} by site and month, {m.unit}
            </caption>
            <thead>
              <tr>
                <th scope="col" className="w-[26%] text-left font-normal text-muted-foreground">
                  <span className="sr-only">Site</span>
                </th>
                {m.months.map((mo) => (
                  <th key={mo} scope="col" className="text-center font-normal text-muted-foreground">
                    {formatMonth(mo)[0]}
                    <span className="sr-only">{formatMonth(mo, true)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {m.rows.map((r) => (
                <tr key={r.siteId}>
                  <th scope="row" className="truncate pr-2 text-left text-sm font-normal">
                    {link ? (
                      <Link href={siteHref(r.siteId, link)} className="underline-offset-2 hover:underline focus-visible:underline">
                        {r.siteName}
                      </Link>
                    ) : (
                      r.siteName
                    )}
                  </th>
                  {r.cells.map((c) => (
                    <td
                      key={c.month}
                      title={`${r.siteName}, ${formatMonth(c.month, true)}: ${formatCardValue(c.value, m.unit)}${m.unit === "%" ? "%" : ""}${c.highlight ? " (highlighted)" : ""}`}
                      data-highlight={c.highlight}
                      className={`h-6 rounded-sm text-center align-middle ${c.highlight ? "bg-chart-flag" : "bg-muted"}`}
                    >
                      {c.highlight && <span aria-hidden className="mx-auto block size-1.5 rounded-full bg-background" />}
                      <span className="sr-only">
                        {formatCardValue(c.value, m.unit)}
                        {c.highlight ? ", highlighted" : ""}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ChartFrame>
  );
}
