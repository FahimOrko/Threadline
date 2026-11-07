// A Fact is the only way a number leaves the engine: raw value, unit and full provenance (ADR 0004, 0005).
import type { Method, Source } from "@/lib/provenance";

export type Period = { from: string; to: string }; // inclusive "YYYY-MM"

/** The value of a Fact that must have one; throws instead of turning null into a number. */
export function requireValue(fact: Pick<Fact, "id" | "value">): number {
  if (fact.value === null) throw new Error(`Fact ${fact.id} has no value`);
  return fact.value;
}

export type Fact = {
  id: string;
  label: string;
  /** null = a required team assumption is unset ("needs input", ADR 0016). Never 0 or NaN. */
  value: number | null;
  unit: string;
  methods: Method[];
  source: Source;
  assumptionIds: string[];
  confidence: string;
  formula: string;
  /** `note` marks long explanatory text; the UI shows it as a full-width note, not a row. */
  inputs: { label: string; value: number | string; unit?: string; note?: true }[];
  scope: { customerId: string; customerName: string; siteId?: string; siteName?: string };
  period: Period;
  baseline: string | null;
  /** null = not modelled yet (sensitivity arrives in Slice 4). */
  range: { low: number | null; base: number | null; high: number | null };
};

/** Customer, plus one of its sites when `siteId` is set. */
export type Scope = { customerId: string; siteId?: string };

/** Row filter shared by every Fact builder: the customer's rows, narrowed to one site when the scope has one. */
export const inScope = (r: { customer_id: string; site_id: string }, s: Scope) =>
  r.customer_id === s.customerId && (s.siteId === undefined || r.site_id === s.siteId);

/** The `scope` of a Fact; the site keys are only present for a site scope. */
export function factScope(
  data: { customers: { customer_id: string; customer_name: string }[]; sites: { site_id: string; site_name: string }[] },
  s: Scope,
): Fact["scope"] {
  const customer = data.customers.find((c) => c.customer_id === s.customerId);
  const base = { customerId: s.customerId, customerName: customer?.customer_name ?? s.customerId };
  if (s.siteId === undefined) return base;
  return { ...base, siteId: s.siteId, siteName: data.sites.find((x) => x.site_id === s.siteId)?.site_name ?? s.siteId };
}
