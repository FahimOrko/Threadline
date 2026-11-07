// Money and utilization KPIs (Slice 3, change 2a). Pure: data in, Facts out; display strings come from src/lib/format.
import type { AppData, Product } from "@/lib/data/schemas";
import { TEAM_ASSUMPTIONS, type TeamAssumption, type TeamAssumptions } from "./assumptions-config";
import { requireValue, type Fact } from "./fact";
import { garmentsInCirculation, latestRows, type OperationalScope } from "./operational";

type ValueData = Pick<AppData, "sites" | "customers" | "assumptions" | "repairs" | "serviceActivity" | "products">;
type Inputs = Fact["inputs"];

const NO_RATING = "Not rated (no assumption applies)";
const PRODUCT_COST_NOTE =
  "Purchase cost per piece comes from products.csv (synthetic_purchase_cost_eur). It is synthetic pack data, not a team assumption.";

/** Purchase cost of a product. The build already rejects unknown ids (ADR 0012 cross-check); this is the backstop. */
export function productCost(products: Product[], productId: string): number {
  const p = products.find((x) => x.product_id === productId);
  if (!p) throw new Error(`Product ${productId} is missing from the products data`);
  return p.synthetic_purchase_cost_eur;
}

/** Fact inputs for a team assumption: id and name, value or "not set", unit, and its note (full width in Show math). */
export function teamAssumptionInputs(name: string, a: TeamAssumption): Inputs {
  return [
    a.value === null
      ? { label: `${a.id} ${name}`, value: "not set" }
      : { label: `${a.id} ${name}`, value: a.value, unit: a.unit },
    { label: `${a.id} note`, note: true, value: a.note },
  ];
}

function build(
  data: ValueData,
  { customerId, period }: OperationalScope,
  f: Pick<Fact, "id" | "label" | "value" | "unit" | "methods" | "source" | "assumptionIds" | "confidence" | "formula" | "inputs">,
): Fact {
  const customer = data.customers.find((c) => c.customer_id === customerId);
  return {
    ...f,
    scope: { customerId, customerName: customer?.customer_name ?? customerId },
    period,
    baseline: null,
    range: { low: null, base: f.value, high: null },
  };
}

/** Per product: piece counts times the product's purchase cost, with the inputs that show it. */
function costByProduct(data: ValueData, pieces: { product_id: string; n: number }[], noun: string) {
  const byProduct = new Map<string, number>();
  for (const r of pieces) byProduct.set(r.product_id, (byProduct.get(r.product_id) ?? 0) + r.n);
  let total = 0;
  const inputs: Inputs = [];
  for (const [id, n] of [...byProduct].sort(([a], [b]) => a.localeCompare(b))) {
    const cost = productCost(data.products, id);
    const name = data.products.find((p) => p.product_id === id)!.product_name;
    total += n * cost;
    inputs.push({ label: `${name}: ${noun}`, value: n }, { label: `${name}: purchase cost per piece`, value: cost, unit: "EUR" });
  }
  return { total, inputs };
}

export function avoidedPurchaseCost(data: ValueData, scope: OperationalScope): Fact {
  const a002 = data.assumptions.find((a) => a.assumption_id === "A002");
  if (!a002) throw new Error("Assumption A002 is missing from the assumptions data");
  const rows = data.repairs.filter(
    (r) => r.customer_id === scope.customerId && r.month >= scope.period.from && r.month <= scope.period.to,
  );
  const { total, inputs } = costByProduct(data, rows.map((r) => ({ product_id: r.product_id, n: r.repair_count })), "repairs");
  return build(data, scope, {
    id: "avoided_purchase_cost",
    label: "Avoided purchase cost",
    value: total,
    unit: "EUR",
    methods: ["ESTIMATED"],
    source: "SYNTHETIC",
    assumptionIds: ["A002"],
    confidence: a002.confidence,
    formula: "avoided purchase cost = sum of repair_count x purchase cost per piece (1 repair = 1 postponed replacement, A002)",
    inputs: [
      { label: "Repair rows summed", value: rows.length },
      ...inputs,
      { label: "Purchase cost", note: true, value: PRODUCT_COST_NOTE },
    ],
  });
}

export function garmentValueKeptInUse(data: ValueData, scope: OperationalScope): Fact {
  const rows = latestRows(data, scope);
  const { total, inputs } = costByProduct(data, rows.map((r) => ({ product_id: r.product_id, n: r.allocated_pieces })), "allocated pieces");
  return build(data, scope, {
    id: "garment_value_kept_in_use",
    label: "Garment value kept in use (Dec)",
    value: total,
    unit: "EUR",
    methods: ["ILLUSTRATIVE"],
    source: "SYNTHETIC",
    assumptionIds: [],
    confidence: NO_RATING,
    formula: `garment value kept in use = sum of allocated_pieces x purchase cost per piece for ${scope.period.to}`,
    inputs: [
      { label: "Month used", value: scope.period.to },
      { label: "Service-activity rows summed", value: rows.length },
      ...inputs,
      { label: "Purchase cost", note: true, value: PRODUCT_COST_NOTE },
    ],
  });
}

/** December snapshot: allocated pieces (same figure as Garments in circulation) and scanned pieces. */
function snapshot(data: ValueData, scope: OperationalScope) {
  const rows = latestRows(data, scope);
  const allocated = requireValue(garmentsInCirculation(data, scope));
  const scanned = rows.reduce((s, r) => s + r.active_assets_scanned, 0);
  return { rows, allocated, scanned, month: { label: "Month used", value: scope.period.to } };
}

export function garmentUtilization(data: ValueData, scope: OperationalScope): Fact {
  const { rows, allocated, scanned, month } = snapshot(data, scope);
  return build(data, scope, {
    id: "garment_utilization",
    label: "Garment utilization (Dec)",
    value: allocated === 0 ? 0 : (scanned / allocated) * 100,
    unit: "%",
    methods: ["CALCULATED"],
    source: "SYNTHETIC",
    assumptionIds: [],
    confidence: NO_RATING,
    formula: `garment utilization = active_assets_scanned / allocated_pieces x 100 for ${scope.period.to}`,
    inputs: [
      month,
      { label: "Service-activity rows summed", value: rows.length },
      { label: "Allocated pieces (Dec)", value: allocated, unit: "pieces" },
      { label: "Active assets scanned (Dec)", value: scanned, unit: "pieces" },
      ...(allocated === 0 ? [{ label: "Undefined", note: true as const, value: "Utilization is undefined without allocated pieces; shown as 0" }] : []),
    ],
  });
}

export function costOfUnusedAllocation(
  data: ValueData,
  scope: OperationalScope,
  team: TeamAssumptions = TEAM_ASSUMPTIONS,
): Fact {
  const { rows, allocated, scanned, month } = snapshot(data, scope);
  const unused = allocated - scanned;
  const fee = team.rentalFeePerPieceWeek;
  return build(data, scope, {
    id: "cost_of_unused_allocation",
    label: "Cost of unused allocation (Dec, per week)",
    value: fee.value === null ? null : unused * fee.value,
    unit: "EUR per week",
    methods: ["ESTIMATED"],
    source: "ASSUMPTION",
    assumptionIds: [fee.id],
    confidence: "Assumed",
    formula: `cost of unused allocation = unused pieces (allocated_pieces minus active_assets_scanned, ${scope.period.to}) x ${fee.id} rental fee per piece per week`,
    inputs: [
      month,
      { label: "Service-activity rows summed", value: rows.length },
      { label: "Allocated pieces (Dec)", value: allocated, unit: "pieces" },
      { label: "Active assets scanned (Dec)", value: scanned, unit: "pieces" },
      { label: "Unused pieces (Dec)", value: unused, unit: "pieces" },
      ...teamAssumptionInputs("rental fee per piece per week", fee),
      ...(fee.value === null ? [{ label: "Not computed", note: true as const, value: `No cost is shown until ${fee.id} has a value` }] : []),
    ],
  });
}

/** The four money and utilization Facts in dashboard order. */
export function valueFacts(data: ValueData, scope: OperationalScope, team: TeamAssumptions = TEAM_ASSUMPTIONS): Fact[] {
  return [
    avoidedPurchaseCost(data, scope),
    garmentValueKeptInUse(data, scope),
    costOfUnusedAllocation(data, scope, team),
    garmentUtilization(data, scope),
  ];
}
