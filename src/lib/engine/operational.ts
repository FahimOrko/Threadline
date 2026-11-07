// Operational KPIs (Slice 3, change 1). Pure: data in, Facts out; display strings come from src/lib/format.
import type { AppData } from "@/lib/data/schemas";
import type { Method } from "@/lib/provenance";
import { factScope, inScope, requireValue, type Fact, type Period } from "./fact";
import { replacementsPostponed } from "./replacements-postponed";

type OperationalData = Pick<AppData, "sites" | "customers" | "assumptions" | "repairs" | "serviceActivity">;
/** `siteId` narrows every Fact to one site (change site-drill-down); without it the scope is the whole customer. */
export type OperationalScope = { customerId: string; period: Period; siteId?: string };

const NO_RATING = "Not rated (no assumption applies)";
const inPeriod = (month: string, p: Period) => month >= p.from && month <= p.to;
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** Service-activity rows of the customer in the latest month of the period. */
export const latestRows = (data: OperationalData, scope: OperationalScope) =>
  data.serviceActivity.filter((r) => inScope(r, scope) && r.month === scope.period.to);

/** Active-wearers rule: maximum across product rows per site (rows repeat the same people), then sum sites. */
function wearersBySite(rows: OperationalData["serviceActivity"]): Map<string, number> {
  const bySite = new Map<string, number>();
  for (const r of rows) bySite.set(r.site_id, Math.max(bySite.get(r.site_id) ?? 0, r.active_wearers));
  return bySite;
}

function fact(
  data: OperationalData,
  { customerId, period, siteId }: OperationalScope,
  f: Pick<Fact, "id" | "label" | "value" | "unit" | "methods" | "formula" | "inputs">,
): Fact {
  return {
    ...f,
    source: "SYNTHETIC",
    assumptionIds: [],
    confidence: NO_RATING,
    scope: factScope(data, { customerId, siteId }),
    period,
    baseline: null,
    range: { low: null, base: f.value, high: null },
  };
}

export function deliverySites(data: OperationalData, scope: OperationalScope): Fact {
  const value = data.sites.filter((s) => s.customer_id === scope.customerId).length;
  return fact(data, scope, {
    id: "delivery_sites",
    label: "Delivery sites",
    value,
    unit: "sites",
    methods: ["MEASURED"],
    formula: "delivery sites = count of the customer's sites in the site master data",
    inputs: [{ label: "Sites counted", value, unit: "sites" }],
  });
}

export function activeWearers(data: OperationalData, scope: OperationalScope): Fact {
  const rows = latestRows(data, scope);
  const value = sum([...wearersBySite(rows).values()]);
  const packSum = sum(rows.map((r) => r.active_wearers));
  return fact(data, scope, {
    id: "active_wearers",
    label: "Active wearers",
    value,
    unit: "wearers",
    methods: ["CALCULATED"],
    formula: `active wearers = per site the maximum across product rows, summed over sites, for ${scope.period.to}`,
    inputs: [
      { label: "Month used", value: scope.period.to },
      { label: "Service-activity rows in that month", value: rows.length },
      { label: "Sum across product rows (pack method, not used)", value: packSum, unit: "wearers" },
      {
        label: "Why it differs from the pack",
        note: true,
        value:
          "The pack's sample_output.csv sums active wearers across product rows, so one person wearing several products is counted several times. This KPI takes the maximum across product rows per site, then sums sites.",
      },
      ...(rows.length === 0 ? [{ label: "Note", note: true as const, value: "No service-activity rows found for this customer and month" }] : []),
    ],
  });
}

export function garmentsInCirculation(data: OperationalData, scope: OperationalScope): Fact {
  const rows = latestRows(data, scope);
  const value = sum(rows.map((r) => r.allocated_pieces));
  return fact(data, scope, {
    id: "garments_in_circulation",
    label: "Garments in circulation",
    value,
    unit: "pieces",
    methods: ["MEASURED"],
    formula: `garments in circulation = sum of allocated_pieces for ${scope.period.to}`,
    inputs: [
      { label: "Month used", value: scope.period.to },
      { label: "Service-activity rows summed", value: rows.length },
    ],
  });
}

export function repairs(data: OperationalData, scope: OperationalScope): Fact {
  const rows = data.repairs.filter((r) => inScope(r, scope) && inPeriod(r.month, scope.period));
  const value = sum(rows.map((r) => r.repair_count));
  return fact(data, scope, {
    id: "repairs",
    label: "Repairs",
    value,
    unit: "repairs",
    methods: ["MEASURED"],
    formula: "repairs = sum of repair_count in the period",
    inputs: [{ label: "Repair rows summed", value: rows.length }],
  });
}

const requestRows = (data: OperationalData, scope: OperationalScope) =>
  data.serviceActivity.filter((r) => inScope(r, scope) && inPeriod(r.month, scope.period));

export function serviceRequests(data: OperationalData, scope: OperationalScope): Fact {
  const rows = requestRows(data, scope);
  const value = sum(rows.map((r) => r.service_requests));
  return fact(data, scope, {
    id: "service_requests",
    label: "Service requests",
    value,
    unit: "requests",
    methods: ["MEASURED"],
    formula: "service requests = sum of service_requests in the period",
    inputs: [{ label: "Service-activity rows summed", value: rows.length }],
  });
}

export function serviceRequestsPer100Wearers(data: OperationalData, scope: OperationalScope): Fact {
  const requests = requireValue(serviceRequests(data, scope));
  const wearers = requireValue(activeWearers(data, scope));
  const value = wearers === 0 ? 0 : (requests / wearers) * 100;
  return fact(data, scope, {
    id: "service_requests_per_100_wearers",
    label: "Service requests per 100 wearers (Dec)",
    value,
    unit: "per 100 wearers",
    methods: ["CALCULATED"],
    formula: "per 100 wearers (Dec) = full-year service requests / December active wearers x 100",
    inputs: [
      { label: "Service requests (full year)", value: requests, unit: "requests" },
      { label: "Active wearers (Dec)", value: wearers, unit: "wearers" },
      {
        label: "Note",
        note: true,
        value:
          "Divides the full-year service-request count by the December wearers, so it is an approximation, not a rate for one period.",
      },
      ...(wearers === 0 ? [{ label: "Undefined", note: true as const, value: "The rate is undefined without wearers; shown as 0" }] : []),
    ],
  });
}

/** The seven operational Facts in dashboard order. */
export function operationalFacts(data: OperationalData, scope: OperationalScope): Fact[] {
  return [
    deliverySites(data, scope),
    activeWearers(data, scope),
    garmentsInCirculation(data, scope),
    repairs(data, scope),
    replacementsPostponed(data, scope),
    serviceRequests(data, scope),
    serviceRequestsPer100Wearers(data, scope),
  ];
}

export type SiteColumnKey = "wearers" | "garments" | "repairs" | "requests";
export type SiteRow = { siteId: string; siteName: string } & Record<SiteColumnKey, number>;
export type SiteColumn = {
  label: string;
  unit: string;
  methods: Method[];
  source: Fact["source"];
  formula: string;
  inputs: Fact["inputs"];
  assumptionIds: string[];
  confidence: string;
};
export type SiteRows = {
  scope: Fact["scope"];
  period: Period;
  rows: SiteRow[];
  columns: Record<SiteColumnKey, SiteColumn>;
};

/** One row per site of the customer (sites without activity show zeros) and one provenance block per column. */
export function operationalSiteRows(data: OperationalData, scope: OperationalScope): SiteRows {
  const { customerId, period } = scope;
  const wearers = wearersBySite(latestRows(data, scope));
  const latest = latestRows(data, scope);
  const reqs = requestRows(data, scope);
  const reps = data.repairs.filter((r) => r.customer_id === customerId && inPeriod(r.month, period));
  const rows = data.sites
    .filter((s) => s.customer_id === customerId)
    .map((s) => ({
      siteId: s.site_id,
      siteName: s.site_name,
      wearers: wearers.get(s.site_id) ?? 0,
      garments: sum(latest.filter((r) => r.site_id === s.site_id).map((r) => r.allocated_pieces)),
      repairs: sum(reps.filter((r) => r.site_id === s.site_id).map((r) => r.repair_count)),
      requests: sum(reqs.filter((r) => r.site_id === s.site_id).map((r) => r.service_requests)),
    }));
  const col = (c: Pick<SiteColumn, "label" | "unit" | "methods" | "formula" | "inputs">): SiteColumn => ({
    ...c,
    source: "SYNTHETIC",
    assumptionIds: [],
    confidence: NO_RATING,
  });
  const month = { label: "Month used", value: period.to };
  const customer = data.customers.find((c) => c.customer_id === customerId);
  return {
    scope: { customerId, customerName: customer?.customer_name ?? customerId },
    period,
    rows,
    columns: {
      wearers: col({
        label: "Active wearers",
        unit: "wearers",
        methods: ["CALCULATED"],
        formula: `per site the maximum of active_wearers across product rows, for ${period.to}`,
        inputs: [month],
      }),
      garments: col({
        label: "Garments in circulation",
        unit: "pieces",
        methods: ["MEASURED"],
        formula: `per site the sum of allocated_pieces for ${period.to}`,
        inputs: [month],
      }),
      repairs: col({
        label: "Repairs",
        unit: "repairs",
        methods: ["MEASURED"],
        formula: "per site the sum of repair_count in the period",
        inputs: [],
      }),
      requests: col({
        label: "Service requests",
        unit: "requests",
        methods: ["MEASURED"],
        formula: "per site the sum of service_requests in the period",
        inputs: [],
      }),
    },
  };
}
