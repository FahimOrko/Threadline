"use client";

import Link from "next/link";
import { useState } from "react";
import { Segmented } from "@/components/segmented";
import { formatCardValue, formatMonth } from "@/lib/format";
import type { SiteMatrix } from "@/lib/engine";
import { siteHref } from "@/lib/selection";

const LEVEL = ["bg-heat-0", "bg-heat-1", "bg-heat-2", "bg-heat-3", "bg-heat-4"] as const;

/** Sites by month, five steps of one colour, with a measure toggle. It is a real table: each cell holds its value as text for assistive technology and as a tooltip. */
export function Heatmap({ matrices, link }: { matrices: SiteMatrix[]; /** The params a site link keeps; without them the names are plain text. */ link?: { customer: string; baseline: string; sensitivity: string } }) {
  const [measure, setMeasure] = useState(matrices[0].measure);
  const m = matrices.find((x) => x.measure === measure) ?? matrices[0];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Segmented label="Measure" hideLabel value={m.measure} onChange={(v) => setMeasure(v as typeof measure)} options={matrices.map((x) => ({ value: x.measure, label: x.label }))} />
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-hidden>
          Lower
          {LEVEL.map((c) => (
            <span key={c} className={`size-3 rounded-sm border ${c}`} />
          ))}
          Higher
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
                  <td key={c.month} title={`${r.siteName}, ${formatMonth(c.month, true)}: ${formatCardValue(c.value, m.unit)}${m.unit === "%" ? "%" : ""}`} data-level={c.level} className={`h-6 rounded-sm ${LEVEL[c.level]}`}>
                    <span className="sr-only">{formatCardValue(c.value, m.unit)}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
