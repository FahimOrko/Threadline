// Monthly series (G1): the dashboard's trend lines, sparklines and heatmap. Plain aggregations of the Fact builders run month by month;
// nothing here is modelled. Pure: data in, series out; display strings come from src/lib/format.
import type { AppData } from "@/lib/data/schemas";
import { TEAM_ASSUMPTIONS, type TeamAssumptions } from "./assumptions-config";
import { requireValue, type Fact, type Period } from "./fact";
import { footprintFacts, type Baseline, type Sensitivity } from "./footprint";
import { repairs, serviceRequests, type OperationalScope } from "./operational";
import { monthsOf } from "./signals";
import { avoidedPurchaseCost, garmentUtilization } from "./value";

type SeriesData = Pick<
  AppData,
  "sites" | "customers" | "assumptions" | "repairs" | "serviceActivity" | "products" | "impactAllocation" | "laundryResources"
>;

export const SERIES_MEASURES = ["repairs", "service_requests", "avoided_purchase_cost", "water_saved", "energy_saved", "co2e_saved", "garment_utilization"] as const;
export type SeriesMeasure = (typeof SERIES_MEASURES)[number];
/** A snapshot measure (a state at the end of a month) is not summed: its window is its last month. */
const SNAPSHOT: ReadonlySet<SeriesMeasure> = new Set(["garment_utilization"]);
export const WINDOW_MONTHS = [3, 6, 12] as const;
export type WindowMonths = (typeof WINDOW_MONTHS)[number];

export type SeriesPoint = { month: string; /** Null when a team assumption the value needs is unset. */ value: number | null };
export type SeriesTrend = { /** The earlier span. */ from: Period; /** The later span. */ to: Period; /** Relative change in percent. */ change: number; direction: "up" | "down" | "flat" };
export type MonthlySeries = {
  measure: SeriesMeasure;
  /** The Fact this series breaks down: the same measure over the whole period. Its provenance is the series' provenance. Null for a footprint measure without washed kg. */
  fact: Fact | null;
  label: string;
  unit: string;
  points: SeriesPoint[];
  /** The total of the last 3, 6 and 12 months (a snapshot measure's last month). A window the series is too short for is absent; null when a point is null. */
  windows: Partial<Record<WindowMonths, { from: string; to: string; value: number | null }>>;
  /** Absent for a series too short, a zero earlier span or a null point. */
  trend?: SeriesTrend;
};

type Opts = { baseline: Baseline; sensitivity: Sensitivity };
const monthScope = (scope: OperationalScope, month: string): OperationalScope => ({ ...scope, period: { from: month, to: month } });

/** The Fact of `measure` for `scope`; null when the engine has none (a footprint measure without washed kg). */
function factOf(data: SeriesData, scope: OperationalScope, measure: SeriesMeasure, o?: Opts): Fact | null {
  switch (measure) {
    case "repairs":
      return repairs(data, scope);
    case "service_requests":
      return serviceRequests(data, scope);
    case "avoided_purchase_cost":
      return avoidedPurchaseCost(data, scope);
    case "garment_utilization":
      return garmentUtilization(data, scope);
    default:
      if (!o) throw new Error(`The ${measure} series needs a baseline and a sensitivity`);
      return footprintFacts(data, scope, o.baseline, o.sensitivity).find((f) => f.id === measure) ?? null;
  }
}

const sum = (xs: (number | null)[]): number | null => (xs.some((x) => x === null) ? null : (xs as number[]).reduce((a, b) => a + b, 0));

/** Relative change in percent, flat when it rounds to 0.0 at display. */
function change(recent: number, earlier: number): Pick<SeriesTrend, "change" | "direction"> | null {
  if (earlier === 0) return null;
  const c = ((recent - earlier) / Math.abs(earlier)) * 100;
  return { change: c, direction: Math.round(c * 10) === 0 ? "flat" : c > 0 ? "up" : "down" };
}

/** `o` (baseline and sensitivity) is only needed for the footprint measures. */
export function monthlySeries(data: SeriesData, scope: OperationalScope, measure: SeriesMeasure, o?: Opts): MonthlySeries {
  const fact = factOf(data, scope, measure, o);
  const months = monthsOf(scope.period.from, scope.period.to);
  // A footprint measure with no washed kg in a month saved nothing that month, so that month is 0, not unknown.
  const points: SeriesPoint[] = months.map((month) => ({ month, value: factOf(data, monthScope(scope, month), measure, o)?.value ?? (measure.endsWith("_saved") ? 0 : null) }));
  const snapshot = SNAPSHOT.has(measure);
  const windows: MonthlySeries["windows"] = {};
  for (const n of WINDOW_MONTHS) {
    if (points.length < n) continue;
    const last = points.slice(-n);
    windows[n] = { from: last[0].month, to: last[n - 1].month, value: snapshot ? last[n - 1].value : sum(last.map((p) => p.value)) };
  }
  let trend: SeriesTrend | undefined;
  const span = (ps: SeriesPoint[]): Period => ({ from: ps[0].month, to: ps[ps.length - 1].month });
  if (snapshot && points.length >= 4) {
    const [earlier, recent] = [points[points.length - 4], points[points.length - 1]];
    const c = earlier.value !== null && recent.value !== null ? change(recent.value, earlier.value) : null;
    if (c) trend = { from: span([earlier]), to: span([recent]), ...c };
  } else if (!snapshot && points.length >= 6) {
    const [earlier, recent] = [points.slice(-6, -3), points.slice(-3)];
    const [e, r] = [sum(earlier.map((p) => p.value)), sum(recent.map((p) => p.value))];
    const c = e !== null && r !== null ? change(r, e) : null;
    if (c) trend = { from: span(earlier), to: span(recent), ...c };
  }
  return { measure, fact, label: fact?.label ?? measure, unit: fact?.unit ?? "", points, windows, trend };
}

export type MatrixMeasure = "garment_utilization" | "repairs";
export type MatrixCell = { month: string; value: number; /** 0 to 4: five equal steps from the customer's lowest to highest cell. */ level: 0 | 1 | 2 | 3 | 4 };
export type SiteMatrix = { measure: MatrixMeasure; label: string; unit: string; months: string[]; rows: { siteId: string; siteName: string; cells: MatrixCell[] }[] };

/** One row per site, one cell per month: the monthly series of the measure with that site in the scope, plus the heatmap level. */
export function monthlySeriesBySite(data: SeriesData, scope: OperationalScope, measure: MatrixMeasure): SiteMatrix {
  const months = monthsOf(scope.period.from, scope.period.to);
  const raw = data.sites
    .filter((s) => s.customer_id === scope.customerId)
    .map((s) => ({
      siteId: s.site_id,
      siteName: s.site_name,
      values: months.map((m) => requireValue(measure === "repairs" ? repairs(data, { ...monthScope(scope, m), siteId: s.site_id }) : garmentUtilization(data, { ...monthScope(scope, m), siteId: s.site_id }))),
    }));
  const all = raw.flatMap((r) => r.values);
  const [lo, hi] = [Math.min(...all), Math.max(...all)];
  const level = (v: number): MatrixCell["level"] => (hi === lo ? 0 : (Math.min(4, Math.floor(((v - lo) / (hi - lo)) * 5)) as MatrixCell["level"]));
  return {
    measure,
    label: measure === "repairs" ? "Repairs" : "Garment utilization",
    unit: measure === "repairs" ? "repairs" : "%",
    months,
    rows: raw.map((r) => ({ siteId: r.siteId, siteName: r.siteName, cells: months.map((month, i) => ({ month, value: r.values[i], level: level(r.values[i]) })) })),
  };
}

/** The over-allocation cut-off (T007) as a percent, for the utilization chart's tick. Null while the assumption is unset. */
export function overAllocationCutoffPercent(team: TeamAssumptions = TEAM_ASSUMPTIONS): { id: string; percent: number | null } {
  const c = team.overAllocationCutoff;
  return { id: c.id, percent: c.value === null ? null : c.value * 100 };
}
