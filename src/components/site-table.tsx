"use client";

import Link from "next/link";
import { useState } from "react";
import { CaretDown, CaretUp, CaretUpDown } from "@phosphor-icons/react";
import { EmptyState } from "@/components/states";
import { Panel } from "@/components/panel";
import { ProvenanceChip } from "@/components/provenance-chip";
import { ShowMathPopover } from "@/components/show-math";
import type { SiteColumnKey, SiteRows } from "@/lib/engine";
import { formatNumber, formatPeriod, formatQuantity } from "@/lib/format";
import { label } from "@/lib/provenance";

const COLUMNS: SiteColumnKey[] = ["wearers", "garments", "repairs", "requests"];
type SortKey = "name" | SiteColumnKey;
type Sort = { key: SortKey; dir: "ascending" | "descending" } | null;
const SORT_ICON = { ascending: CaretUp, descending: CaretDown } as const;

function SortButton({ k, sort, onToggle, children }: { k: SortKey; sort: Sort; onToggle: (k: SortKey) => void; children: React.ReactNode }) {
  const Icon = sort?.key === k ? SORT_ICON[sort.dir] : CaretUpDown;
  return (
    <button type="button" onClick={() => onToggle(k)} className="inline-flex items-center gap-1 rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
      {children}
      <Icon aria-hidden size={12} className={sort?.key === k ? "" : "text-muted-foreground"} />
    </button>
  );
}
const NA = "not applicable";

// Mixed methods per column, so each numeric header carries its own compact chip and Show math.
/** `openColumn` opens one header's Show math on first render; only the /design gallery uses it. */
export function SiteTable({
  table,
  openColumn,
}: {
  table: SiteRows;
  openColumn?: SiteColumnKey;
}) {
  // Sorting and filtering only reorder and hide the engine's rows; no value is changed or recomputed.
  const [sort, setSort] = useState<Sort>(null);
  const [filter, setFilter] = useState("");
  const toggle = (key: SortKey) => setSort((s) => (s?.key !== key ? { key, dir: "ascending" } : s.dir === "ascending" ? { key, dir: "descending" } : null));
  const aria = (key: SortKey) => (sort?.key === key ? sort.dir : "none");
  const q = filter.trim().toLowerCase();
  const rows = table.rows
    .filter((r) => r.siteName.toLowerCase().includes(q))
    .sort((a, b) => {
      if (!sort) return 0;
      const c = sort.key === "name" ? a.siteName.localeCompare(b.siteName) : a[sort.key] - b[sort.key];
      return (sort.dir === "ascending" ? c : -c) || a.siteName.localeCompare(b.siteName);
    });
  if (table.rows.length === 0) {
    return (
      <EmptyState
        title="No sites"
        hint="This customer has no sites in the site master data."
      />
    );
  }
  return (
    <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Filter sites</span>
      <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Site name" className="h-8 w-56 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" />
    </label>
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[34rem] table-fixed text-sm">
        <caption className="sr-only">
          Sites of {table.scope.customerName}, {formatPeriod(table.period)}
        </caption>
        <thead>
          <tr className="border-b align-top">
            <th scope="col" aria-sort={aria("name")} className="w-[28%] px-3 py-2 text-left font-medium">
              <SortButton k="name" sort={sort} onToggle={toggle}>Site</SortButton>
            </th>
            {COLUMNS.map((k) => {
              const c = table.columns[k];
              return (
                <th
                  key={k}
                  scope="col"
                  aria-sort={aria(k)}
                  className="px-2 py-2 text-right text-xs font-medium"
                >
                  <div className="flex flex-col items-end gap-1">
                    <SortButton k={k} sort={sort} onToggle={toggle}>
                      <span>
                        {c.label}{" "}
                        <span className="font-normal text-muted-foreground">
                          ({c.unit})
                        </span>
                      </span>
                    </SortButton>
                    <ProvenanceChip
                      compact
                      methods={c.methods}
                      source={c.source}
                    />
                    <ShowMathPopover
                      align="end"
                      defaultOpen={openColumn === k}
                      formula={c.formula}
                      inputs={[
                        { label: "Customer", value: table.scope.customerName },
                        { label: "Period", value: formatPeriod(table.period) },
                        {
                          label: "Method",
                          value: c.methods.map(label).join(", "),
                        },
                        { label: "Source", value: label(c.source) },
                        ...c.inputs.map((i) => ({
                          label: i.label,
                          value:
                            typeof i.value === "number"
                              ? formatQuantity(i.value, i.unit)
                              : i.value,
                        })),
                        { label: "Confidence", value: c.confidence },
                      ]}
                      assumptionIds={c.assumptionIds}
                      baseline={NA}
                      range={{ low: NA, base: NA, high: NA }}
                    />
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-3 text-muted-foreground">
                No site matches &quot;{filter}&quot;.
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.siteId} className="h-7 border-b last:border-b-0">
              <th scope="row" className="px-3 text-left font-normal">
                <Link
                  href={`/dashboard/sites/${encodeURIComponent(r.siteId)}?customer=${encodeURIComponent(table.scope.customerId)}`}
                  className="underline-offset-2 hover:underline focus-visible:underline"
                >
                  {r.siteName}
                </Link>
              </th>
              {COLUMNS.map((k) => (
                <td key={k} className="num px-2 text-right">
                  {formatNumber(r[k])}
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

// Same outer box as the table so the layout does not jump when data arrives.
export function SiteTableSkeleton() {
  return (
    <Panel role="status" aria-label="Loading" className="space-y-2">
      <div className="h-8 w-full rounded-md bg-muted motion-safe:animate-pulse" />
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-5 w-full rounded-md bg-muted motion-safe:animate-pulse"
        />
      ))}
    </Panel>
  );
}
