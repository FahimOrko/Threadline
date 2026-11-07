import Link from "next/link";
import { EmptyState } from "@/components/states";
import { Panel } from "@/components/panel";
import { ProvenanceChip } from "@/components/provenance-chip";
import { ShowMathPopover } from "@/components/show-math";
import type { SiteColumnKey, SiteRows } from "@/lib/engine";
import { formatNumber, formatPeriod, formatQuantity } from "@/lib/format";
import { label } from "@/lib/provenance";

const COLUMNS: SiteColumnKey[] = ["wearers", "garments", "repairs", "requests"];
const NA = "not applicable";

// Mixed methods per column, so each numeric header carries its own compact chip and Show math.
/** `openColumn` opens one header's Show math on first render; only the /design gallery uses it. */
export function SiteTable({ table, openColumn }: { table: SiteRows; openColumn?: SiteColumnKey }) {
  if (table.rows.length === 0) {
    return <EmptyState title="No sites" hint="This customer has no sites in the site master data." />;
  }
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[40rem] table-fixed text-sm">
        <caption className="sr-only">
          Sites of {table.scope.customerName}, {formatPeriod(table.period)}
        </caption>
        <thead>
          <tr className="border-b align-top">
            <th scope="col" className="w-[28%] px-3 py-2 text-left font-medium">
              Site
            </th>
            {COLUMNS.map((k) => {
              const c = table.columns[k];
              return (
                <th key={k} scope="col" className="px-2 py-2 text-right text-xs font-medium">
                  <div className="flex flex-col items-end gap-1">
                    <span>
                      {c.label} <span className="font-normal text-muted-foreground">({c.unit})</span>
                    </span>
                    <ProvenanceChip compact methods={c.methods} source={c.source} />
                    <ShowMathPopover
                      align="end"
                      defaultOpen={openColumn === k}
                      formula={c.formula}
                      inputs={[
                        { label: "Customer", value: table.scope.customerName },
                        { label: "Period", value: formatPeriod(table.period) },
                        { label: "Method", value: c.methods.map(label).join(", ") },
                        { label: "Source", value: label(c.source) },
                        ...c.inputs.map((i) => ({
                          label: i.label,
                          value: typeof i.value === "number" ? formatQuantity(i.value, i.unit) : i.value,
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
          {table.rows.map((r) => (
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
  );
}

// Same outer box as the table so the layout does not jump when data arrives.
export function SiteTableSkeleton() {
  return (
    <Panel role="status" aria-label="Loading" className="space-y-2">
      <div className="h-8 w-full rounded-md bg-muted motion-safe:animate-pulse" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-5 w-full rounded-md bg-muted motion-safe:animate-pulse" />
      ))}
    </Panel>
  );
}
