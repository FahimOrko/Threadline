// What the dashboard pages feed their charts: engine series and Facts picked and ordered, with no arithmetic (ADR 0005, 0024).
import { seriesMath } from "@/components/chart-frame";
import type { SiteLink } from "@/components/site-links";
import type { AreaMeasure } from "@/components/charts-recharts";
import type { AppData } from "@/lib/data/schemas";
import { PERIOD } from "@/lib/dashboard";
import { footprintFacts, monthlySeries, observations, operationalFacts, overAllocationCutoffPercent, percentageFacts, valueFacts, type Fact, type MonthlySeries, type OperationalScope, type Sensitivity, type SeriesMeasure } from "@/lib/engine";
import { chipTone } from "@/lib/provenance";
import { siteHref } from "@/lib/selection";

type Baseline = AppData["baselines"][number];

/** The measures with a monthly series on the Overview: tiles show a sparkline and trend for these. */
const OVERVIEW_SERIES = ["water_saved", "co2e_saved", "avoided_purchase_cost", "garment_utilization"] as const satisfies readonly SeriesMeasure[];
const SHORT_LABEL: Record<(typeof OVERVIEW_SERIES)[number], string> = { water_saved: "Water saved", co2e_saved: "CO2e saved", avoided_purchase_cost: "Avoided cost", garment_utilization: "Utilization" };

/** One estimated or illustrative figure draws dashed (ADR 0024); the chip's tone already decides this for every card. */
export const isUncertain = (f: Fact | null) => f !== null && chipTone(f.methods, f.source) === "uncertain";

/** What the Overview panels show: every Fact by id, the four monthly series and the area chart's measures. Panels only pick and place; no arithmetic. */
export function overviewData(data: AppData, scope: OperationalScope, baseline: Baseline, sensitivity: Sensitivity) {
  const opts = { baseline, sensitivity };
  const series = Object.fromEntries(OVERVIEW_SERIES.map((m) => [m, monthlySeries(data, scope, m, opts)])) as Record<(typeof OVERVIEW_SERIES)[number], MonthlySeries>;
  const pool = [...footprintFacts(data, scope, baseline, sensitivity), ...valueFacts(data, scope), ...percentageFacts(data, scope), ...operationalFacts(data, scope), ...observations(data, scope).facts];
  const measures: AreaMeasure[] = OVERVIEW_SERIES.map((id) => ({
    id,
    label: SHORT_LABEL[id],
    math: seriesMath(series[id].fact),
    series: { points: series[id].points, windows: series[id].windows, unit: series[id].unit, dashed: isUncertain(series[id].fact) },
  }));
  return { facts: pool, series, measures, cutoff: overAllocationCutoffPercent() };
}

type LinkParams = { customer: string; baseline: string; sensitivity: string };

/**
 * The sites each signal counts, in the engine's order, as links to their site pages (params kept). They come from the observations, which list the
 * flagged sites of the same signal as the count Fact, so the list and the figure cannot disagree.
 */
export function flaggedSites(data: AppData, scope: OperationalScope, link: LinkParams): Record<"dormant" | "overAllocated" | "repairSpike", SiteLink[]> {
  const set = observations(data, scope).observations;
  const sites = (id: string): SiteLink[] =>
    (set.find((o) => o.id === id)?.scope.siteIds ?? []).map((siteId) => ({ siteId, siteName: data.sites.find((s) => s.site_id === siteId)?.site_name ?? siteId, href: siteHref(siteId, link) }));
  return { dormant: sites("obs_dormant_critical"), overAllocated: sites("obs_over_allocation"), repairSpike: sites("obs_repair_spike") };
}

/** A product's repair-rate Fact label without its prefix: the product name. */
export const productName = (label: string) => label.replace(/^.*\(Dec\), /, "");

/** Customer's sites with one Fact each, built by the same engine function the customer-level card uses. */
export function bySite<T>(data: AppData, scope: OperationalScope, make: (s: OperationalScope) => T): { siteId: string; siteName: string; result: T }[] {
  return data.sites.filter((s) => s.customer_id === scope.customerId).map((s) => ({ siteId: s.site_id, siteName: s.site_name, result: make({ ...scope, siteId: s.site_id }) }));
}

export { PERIOD };
