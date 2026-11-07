// Footprint KPIs (Slice 3, change 3a): savings vs a baseline, service footprint, delivery footprint.
// Pure: data in, Facts out. The baseline is an argument so Slice 4 only wires the selector.
import { DEFAULT_BASELINE_ID, type AppData, type Baseline } from "@/lib/data/schemas";
import type { Fact } from "./fact";
import { activeWearers, type OperationalScope } from "./operational";
import { build } from "./value";

export { DEFAULT_BASELINE_ID };
export type { Baseline };

type FootprintData = Pick<
  AppData,
  "sites" | "customers" | "assumptions" | "repairs" | "serviceActivity" | "products" | "impactAllocation" | "laundryResources"
>;
type Inputs = Fact["inputs"];

const NO_RATING = "Not rated (no assumption applies)";
// The sheet only has "Outsourced local laundry", so the short names live here, keyed by baseline id.
const SHORT_NAMES: Record<string, string> = { B_LOCAL: "local laundry", B_HOME: "home washing", B_INHOUSE: "in-house laundry" };
export const baselineShortName = (b: Baseline) => SHORT_NAMES[b.baseline_id] ?? b.baseline_name;

const ILLUSTRATIVE_NOTE =
  "The local laundry baseline process factor is marked illustrative in the data pack and sits far above the laundries' own process factors, which drives the high percentage. Read the CO2e saving as an indication until Lindström confirms the factor.";
const DELIVERY_NOTE =
  "A baseline with zero delivery (home washing) makes delivery alone look worse than the baseline. Read delivery together with the net CO2e saved, which covers process and delivery.";
const ROUTE_KM_NOTE = "Route kilometres are not in the data pack, so delivery is not estimated from distance. This is a listed data gap.";

/** Fact ids per dashboard group, in display order. The net CO2e saved Fact appears in the saved and delivery groups. */
export const FOOTPRINT_GROUPS = {
  saved: ["water_saved", "water_saved_pct", "energy_saved", "energy_saved_pct", "co2e_saved", "co2e_saved_pct"],
  service: ["service_footprint", "service_footprint_per_tonne", "service_footprint_per_wearer"],
  delivery: ["delivery_footprint", "delivery_share", "co2e_saved"],
} as const;

type Totals = {
  kg: number;
  laundry: { water: number; energy: number; process: number; delivery: number };
  baseline: { water: number; energy: number; process: number; delivery: number };
  rows: number;
};

/** Washed kg times each factor, summed over the customer's laundry-months. Throws on a laundry-month the build should have rejected. */
function totalsFor(data: FootprintData, scope: OperationalScope, b: Baseline): Totals {
  const t: Totals = {
    kg: 0,
    laundry: { water: 0, energy: 0, process: 0, delivery: 0 },
    baseline: { water: 0, energy: 0, process: 0, delivery: 0 },
    rows: 0,
  };
  for (const a of data.impactAllocation) {
    if (a.customer_id !== scope.customerId || a.month < scope.period.from || a.month > scope.period.to || a.customer_washed_kg === 0) continue;
    const l = data.laundryResources.find((x) => x.laundry_id === a.laundry_id && x.month === a.month);
    // Backstop: the build already fails on a missing laundry-month (docs/conventions.md).
    if (!l || l.washed_kg === 0) throw new Error(`No laundry_resources washed kg for laundry ${a.laundry_id} in ${a.month}`);
    const kg = a.customer_washed_kg;
    t.kg += kg;
    t.rows++;
    t.laundry.water += kg * l.fresh_water_l_per_kg;
    t.laundry.energy += kg * l.energy_kwh_per_kg;
    t.laundry.process += (kg * l.process_emissions_kgco2e) / l.washed_kg;
    t.laundry.delivery += (kg * l.delivery_emissions_kgco2e) / l.washed_kg;
    t.baseline.water += kg * b.water_l_per_kg;
    t.baseline.energy += kg * b.energy_kwh_per_kg;
    t.baseline.process += kg * b.process_kgco2e_per_kg;
    t.baseline.delivery += kg * b.delivery_kgco2e_per_kg;
  }
  return t;
}

export function footprintFacts(data: FootprintData, scope: OperationalScope, baseline: Baseline): Fact[] {
  const t = totalsFor(data, scope, baseline);
  if (t.kg === 0) return [];
  const short = baselineShortName(baseline);
  const a001 = data.assumptions.find((a) => a.assumption_id === "A001");
  if (!a001) throw new Error("Assumption A001 is missing from the assumptions data");

  const withBaseline = (f: Fact): Fact => ({ ...f, baseline: baseline.baseline_name });
  const kgInputs: Inputs = [
    { label: "Laundry-months used", value: t.rows },
    { label: "Customer washed kg", value: t.kg, unit: "kg" },
  ];

  const saved = (id: string, name: string, unit: string, base: number, own: number, baselineFactor: number, note?: string): Fact[] => {
    const saving = base - own;
    const inputs: Inputs = [
      ...kgInputs,
      { label: `Baseline ${name.toLowerCase()} (${baseline.baseline_id})`, value: base, unit },
      { label: `Laundry ${name.toLowerCase()} (kg-weighted)`, value: own, unit },
      { label: "Baseline factor", value: baselineFactor, unit: `${unit}/kg` },
      { label: "Laundry factor (kg-weighted)", value: own / t.kg, unit: `${unit}/kg` },
      { label: "Baseline", value: baseline.baseline_name },
      ...(note ? [{ label: "Baseline note", note: true as const, value: note }] : []),
    ];
    const common = {
      source: "SYNTHETIC" as const,
      methods: ["ALLOCATED", "ESTIMATED"] as Fact["methods"],
      assumptionIds: ["A001"],
      confidence: `${a001.confidence} (A001)`,
      inputs,
    };
    const facts = [
      withBaseline(
        build(data, scope, {
          ...common,
          id,
          label: `${name} saved vs ${short}`,
          value: saving,
          unit,
          formula: `${name.toLowerCase()} saved = sum of washed kg x (baseline factor - laundry factor)${id === "co2e_saved" ? ", factor = process + delivery" : ""}, baseline: ${baseline.baseline_name}`,
        }),
      ),
    ];
    if (base !== 0)
      facts.push(
        withBaseline(
          build(data, scope, {
            ...common,
            id: `${id}_pct`,
            label: `${name} saved vs ${short}, share`,
            value: (saving / base) * 100,
            unit: "%",
            formula: `share = ${name.toLowerCase()} saved / sum of washed kg x baseline factor x 100, baseline: ${baseline.baseline_name}`,
          }),
        ),
      );
    return facts;
  };

  const b = t.baseline;
  const l = t.laundry;
  const co2eBase = b.process + b.delivery;
  const co2eOwn = l.process + l.delivery;
  const savings = [
    ...saved("water_saved", "Water", "L", b.water, l.water, baseline.water_l_per_kg),
    ...saved("energy_saved", "Energy", "kWh", b.energy, l.energy, baseline.energy_kwh_per_kg),
    ...saved("co2e_saved", "Net CO2e", "kgCO2e", co2eBase, co2eOwn, baseline.process_kgco2e_per_kg + baseline.delivery_kgco2e_per_kg, ILLUSTRATIVE_NOTE),
  ];

  const serviceTotal = co2eOwn;
  const common = { source: "SYNTHETIC" as const, assumptionIds: [], confidence: NO_RATING };
  const serviceInputs: Inputs = [
    ...kgInputs,
    { label: "Process emissions (allocated)", value: l.process, unit: "kgCO2e" },
    { label: "Delivery emissions (allocated)", value: l.delivery, unit: "kgCO2e" },
  ];
  const service: Fact[] = [
    build(data, scope, {
      ...common,
      id: "service_footprint",
      label: "Service footprint (process + delivery)",
      value: serviceTotal,
      unit: "kgCO2e",
      methods: ["ALLOCATED"],
      formula: "service footprint = sum of washed kg x (laundry process factor + laundry delivery factor), which is the washed-kg share of the laundry emissions",
      inputs: serviceInputs,
    }),
    build(data, scope, {
      ...common,
      id: "service_footprint_per_tonne",
      label: "Service footprint per tonne washed",
      value: serviceTotal / (t.kg / 1000),
      unit: "kgCO2e/t",
      methods: ["ALLOCATED", "CALCULATED"],
      formula: "per tonne washed = service footprint / (washed kg / 1000)",
      inputs: serviceInputs,
    }),
  ];
  const wearers = activeWearers(data, scope).value;
  if (wearers !== null && wearers > 0)
    service.push(
      build(data, scope, {
        ...common,
        id: "service_footprint_per_wearer",
        label: "Service footprint per active wearer (Dec)",
        value: serviceTotal / wearers,
        unit: "kgCO2e per wearer",
        methods: ["ALLOCATED", "CALCULATED"],
        formula: "per wearer = full-year service footprint / December active wearers",
        inputs: [
          ...serviceInputs,
          { label: "Active wearers (Dec)", value: wearers, unit: "wearers" },
          {
            label: "Note",
            note: true,
            value: "Divides the full-year footprint by the December active wearers, so it is an approximation, not a rate for one period.",
          },
        ],
      }),
    );

  const deliveryInputs: Inputs = [
    ...serviceInputs,
    { label: "Laundry delivery factor (kg-weighted)", value: l.delivery / t.kg, unit: "kgCO2e/kg" },
    { label: `Baseline delivery factor (${baseline.baseline_id})`, value: baseline.delivery_kgco2e_per_kg, unit: "kgCO2e/kg" },
    { label: "Baseline", value: baseline.baseline_name },
    { label: "Reading delivery", note: true, value: DELIVERY_NOTE },
    { label: "Data gap", note: true, value: ROUTE_KM_NOTE },
  ];
  const delivery: Fact[] = [
    withBaseline(
      build(data, scope, {
        ...common,
        id: "delivery_footprint",
        label: "Delivery emissions",
        value: l.delivery,
        unit: "kgCO2e",
        methods: ["ALLOCATED"],
        formula: "delivery emissions = sum of washed kg x laundry delivery factor",
        inputs: deliveryInputs,
      }),
    ),
  ];
  if (serviceTotal > 0)
    delivery.push(
      withBaseline(
        build(data, scope, {
          ...common,
          id: "delivery_share",
          label: "Delivery share of service emissions",
          value: (l.delivery / serviceTotal) * 100,
          unit: "%",
          methods: ["ALLOCATED", "CALCULATED"],
          formula: "delivery share = delivery emissions / service footprint x 100",
          inputs: deliveryInputs,
        }),
      ),
    );

  return [...savings, ...service, ...delivery];
}

/** The Facts of one dashboard group, in group order. */
export function footprintGroup(facts: Fact[], group: keyof typeof FOOTPRINT_GROUPS): Fact[] {
  return FOOTPRINT_GROUPS[group].flatMap((id) => facts.filter((f) => f.id === id));
}
