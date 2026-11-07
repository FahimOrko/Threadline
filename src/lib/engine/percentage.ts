// Percentage KPIs (Slice 3, change 2b). Pure: data in, Facts out; display strings come from src/lib/format.
import type { AppData } from "@/lib/data/schemas";
import { type Fact } from "./fact";
import { latestRows, type OperationalScope } from "./operational";
import { build } from "./value";

type PercentageData = Pick<
  AppData,
  "sites" | "customers" | "assumptions" | "repairs" | "serviceActivity" | "products" | "cycleCounts" | "wasteCircularity" | "impactAllocation"
>;

const NO_RATING = "Not rated (no assumption applies)";
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** ON_TIME cycles / all cycles of the customer's sites. Null without cycles (no Fact rather than 0 or NaN). */
export function onTimeCycleRate(data: PercentageData, scope: OperationalScope): Fact | null {
  const rows = data.cycleCounts.filter((c) => c.customer_id === scope.customerId);
  const cycles = sum(rows.map((r) => r.cycles));
  if (cycles === 0) return null;
  const onTime = sum(rows.map((r) => r.on_time));
  return build(data, scope, {
    id: "on_time_cycle_rate",
    label: "On-time cycle rate (sampled cycles)",
    value: (onTime / cycles) * 100,
    unit: "%",
    methods: ["MEASURED"],
    source: "SYNTHETIC",
    assumptionIds: [],
    confidence: NO_RATING,
    formula: "on-time cycle rate = ON_TIME cycles / all sampled cycles x 100",
    inputs: [
      { label: "Sites with cycles", value: rows.length },
      { label: "Sampled cycles", value: cycles, unit: "cycles" },
      { label: "ON_TIME cycles", value: onTime, unit: "cycles" },
      {
        label: "Note",
        note: true,
        value: "A rate over the sampled cycles in the data pack, not over every service event. All cycles in the sheet are counted; none are filtered by period.",
      },
    ],
  });
}

/** One Fact per product with December allocated pieces: full-year repairs / December allocated pieces. */
export function repairRateByProduct(data: PercentageData, scope: OperationalScope): Fact[] {
  const dec = latestRows(data, scope);
  const facts: Fact[] = [];
  for (const p of data.products) {
    const allocated = sum(dec.filter((r) => r.product_id === p.product_id).map((r) => r.allocated_pieces));
    if (allocated === 0) continue;
    const reps = sum(
      data.repairs
        .filter((r) => r.customer_id === scope.customerId && r.product_id === p.product_id && r.month >= scope.period.from && r.month <= scope.period.to)
        .map((r) => r.repair_count),
    );
    facts.push(
      build(data, scope, {
        id: `repair_rate_${p.product_id}`,
        label: `Repairs per 100 garments (Dec), ${p.product_name}`,
        value: (reps / allocated) * 100,
        unit: "per 100 garments",
        methods: ["CALCULATED"],
        source: "SYNTHETIC",
        assumptionIds: [],
        confidence: NO_RATING,
        formula: "repairs per 100 garments (Dec) = full-year repairs / December allocated pieces x 100, per product",
        inputs: [
          { label: "Product", value: `${p.product_id} ${p.product_name}` },
          { label: "Repairs (full year)", value: reps, unit: "repairs" },
          { label: "Allocated pieces (Dec)", value: allocated, unit: "pieces" },
          {
            label: "Note",
            note: true,
            value: "Counts repair events, so one garment can be repaired more than once and the value can exceed 100. Divides the full-year repair count by the December allocated pieces, so it is an approximation, not a rate for one period.",
          },
        ],
      }),
    );
  }
  return facts;
}

/** Share of the customer's allocated textile waste that is recycled or reused, weighted by allocated kg. */
export function recyclingReuseShare(data: PercentageData, scope: OperationalScope): Fact | null {
  const rows = data.impactAllocation.filter(
    (a) => a.customer_id === scope.customerId && a.month >= scope.period.from && a.month <= scope.period.to,
  );
  let total = 0;
  let recovered = 0;
  for (const a of rows) {
    const w = data.wasteCircularity.find((x) => x.laundry_id === a.laundry_id && x.month === a.month);
    // Backstop: the build already fails on a missing laundry-month (docs/conventions.md).
    if (!w || w.textile_waste_total_kg === 0)
      throw new Error(`No waste_circularity total for laundry ${a.laundry_id} in ${a.month}`);
    total += a.allocated_textile_waste_kg;
    recovered += (a.allocated_textile_waste_kg * (w.recycling_kg + w.reuse_kg)) / w.textile_waste_total_kg;
  }
  if (total === 0) return null;
  const find = (id: string) => {
    const a = data.assumptions.find((x) => x.assumption_id === id);
    if (!a) throw new Error(`Assumption ${id} is missing from the assumptions data`);
    return a;
  };
  const [a3, a4] = [find("A003"), find("A004")];
  return build(data, scope, {
    id: "recycling_reuse_share",
    label: "Recycling and reuse share of textile waste",
    value: (recovered / total) * 100,
    unit: "%",
    methods: ["ALLOCATED", "ESTIMATED"],
    source: "SYNTHETIC",
    assumptionIds: ["A003", "A004"],
    confidence: `${a3.confidence} (A003), ${a4.confidence} (A004)`,
    formula:
      "share = sum of allocated waste kg x (recycling_kg + reuse_kg) / textile_waste_total_kg of its laundry-month, divided by total allocated waste kg x 100. Laundry waste is allocated to the customer by washed-kg share (A003).",
    inputs: [
      { label: "Laundry-months used", value: rows.length },
      { label: "Allocated textile waste", value: total, unit: "kg" },
      { label: "Recycled or reused (allocated)", value: recovered, unit: "kg" },
      {
        label: "Note",
        note: true,
        value: "Source waste is reported per laundry. It is allocated to the customer by washed-kg share (A003), so this is an estimate, not a measurement of the customer's own waste.",
      },
    ],
  });
}

/** The percentage Facts in dashboard order; a Fact without data is left out. */
export function percentageFacts(data: PercentageData, scope: OperationalScope): Fact[] {
  return [onTimeCycleRate(data, scope), ...repairRateByProduct(data, scope), recyclingReuseShare(data, scope)].filter(
    (f): f is Fact => f !== null,
  );
}
