// Footprint KPIs (Slice 3, change 3a): savings vs a baseline, service footprint, delivery footprint.
// Pure: data in, Facts out. The baseline and the sensitivity level are arguments (ADR 0017).
import { DEFAULT_BASELINE_ID, type AppData, type Baseline } from "@/lib/data/schemas";
import { TEAM_ASSUMPTIONS } from "./assumptions-config";
import { factScope, type Fact } from "./fact";
import { activeWearers, type OperationalScope } from "./operational";
import { wasteSplit } from "./percentage";
import { build, teamAssumptionInputs } from "./value";

export const SENSITIVITY_LEVELS = ["low", "base", "high"] as const;
export type Sensitivity = (typeof SENSITIVITY_LEVELS)[number];
export const DEFAULT_SENSITIVITY: Sensitivity = "base";

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
  "The baseline factors are marked illustrative in the data pack and can sit far above the laundries' own factors, which drives the high percentage. Read the CO2e saving as an indication until Lindström confirms the factors.";
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

export function footprintFacts(data: FootprintData, scope: OperationalScope, baseline: Baseline, sensitivity: Sensitivity = DEFAULT_SENSITIVITY): Fact[] {
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

  // Low and high scale the baseline factors only (T002); laundry factors are pack data. Null spread: no low or high.
  const t002 = TEAM_ASSUMPTIONS.sensitivitySpread;
  const scale = { low: t002.value === null ? null : 1 - t002.value, base: 1, high: t002.value === null ? null : 1 + t002.value };
  const levels = (f: (k: number) => number): Fact["range"] => ({
    low: scale.low === null ? null : f(scale.low),
    base: f(1),
    high: scale.high === null ? null : f(scale.high),
  });
  const offBase = sensitivity !== "base";

  const saved = (id: string, name: string, unit: string, base: number, own: number, baselineFactor: number, note?: string): Fact[] => {
    const k = scale[sensitivity];
    const shown = k ?? 1; // inputs show the factors the selected level actually used
    const inputs: Inputs = [
      ...kgInputs,
      { label: `Baseline ${name.toLowerCase()} (${baseline.baseline_id}, ${sensitivity})`, value: base * shown, unit },
      { label: `Laundry ${name.toLowerCase()} (kg-weighted)`, value: own, unit },
      { label: `Baseline factor (${sensitivity})`, value: baselineFactor * shown, unit: `${unit}/kg` },
      { label: "Laundry factor (kg-weighted)", value: own / t.kg, unit: `${unit}/kg` },
      { label: "Baseline", value: baseline.baseline_name },
      { label: "Sensitivity", value: sensitivity },
      ...teamAssumptionInputs("sensitivity spread", t002),
      ...(note ? [{ label: "Baseline note", note: true as const, value: note }] : []),
    ];
    const common = {
      // Off base the value depends on T002, so it is assumed (ADR 0016); at base the pack data alone decides it.
      source: offBase ? ("ASSUMPTION" as const) : ("SYNTHETIC" as const),
      methods: ["ALLOCATED", "ESTIMATED"] as Fact["methods"],
      assumptionIds: offBase ? ["A001", t002.id] : ["A001"],
      confidence: `${a001.confidence} (A001)`,
      inputs,
    };
    const withRange = (f: Fact, range: Fact["range"]): Fact => ({ ...f, range, value: k === null ? null : range[sensitivity] });
    const saving = (m: number) => base * m - own;
    const facts = [
      withRange(
        withBaseline(
          build(data, scope, {
            ...common,
            id,
            label: `${name} saved vs ${short}`,
            value: 0,
            unit,
            formula: `${name.toLowerCase()} saved = sum of washed kg x (baseline factor x sensitivity - laundry factor)${id === "co2e_saved" ? ", factor = process + delivery" : ""}, baseline: ${baseline.baseline_name}, sensitivity: ${sensitivity} (low 1 - T002, base 1, high 1 + T002)`,
          }),
        ),
        levels(saving),
      ),
    ];
    if (base !== 0)
      facts.push(
        withRange(
          withBaseline(
            build(data, scope, {
              ...common,
              id: `${id}_pct`,
              label: `${name} saved vs ${short}, share`,
              value: 0,
              unit: "%",
              formula: `share = ${name.toLowerCase()} saved / sum of washed kg x baseline factor x sensitivity x 100, baseline: ${baseline.baseline_name}, sensitivity: ${sensitivity}`,
            }),
          ),
          levels((m) => (saving(m) / (base * m)) * 100),
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

  // What the comparison would emit (process + delivery): the saving's other half, so a sentence can name it with a token. No new formula.
  const kc = scale[sensitivity];
  const comparisonFact: Fact = withBaseline(
    build(data, scope, {
      source: offBase ? "ASSUMPTION" : "SYNTHETIC",
      methods: ["ALLOCATED", "ESTIMATED"],
      assumptionIds: offBase ? ["A001", t002.id] : ["A001"],
      confidence: `${a001.confidence} (A001)`,
      id: "comparison_footprint",
      label: "CO2e the comparison would emit (process + delivery)",
      value: kc === null ? 0 : co2eBase * kc,
      unit: "kgCO2e",
      formula: `comparison footprint = sum of washed kg x (baseline process factor + baseline delivery factor) x sensitivity, baseline: ${baseline.baseline_name}, sensitivity: ${sensitivity}`,
      inputs: [
        ...kgInputs,
        { label: "Baseline process factor", value: baseline.process_kgco2e_per_kg, unit: "kgCO2e/kg" },
        { label: "Baseline delivery factor", value: baseline.delivery_kgco2e_per_kg, unit: "kgCO2e/kg" },
        { label: "Baseline", value: baseline.baseline_name },
        { label: "Sensitivity", value: sensitivity },
        ...teamAssumptionInputs("sensitivity spread", t002),
      ],
    }),
  );
  if (kc === null) comparisonFact.value = null;
  comparisonFact.range = levels((m) => co2eBase * m);

  return [...savings, comparisonFact, ...service, ...delivery];
}

/** The Facts of one dashboard group, in group order. */
export function footprintGroup(facts: Fact[], group: keyof typeof FOOTPRINT_GROUPS): Fact[] {
  return FOOTPRINT_GROUPS[group].flatMap((id) => facts.filter((f) => f.id === id));
}

type Part = { label: string; value: number; unit: string };
export type FootprintComparison = {
  scope: Fact["scope"];
  period: OperationalScope["period"];
  baseline: string;
  sensitivity: Sensitivity;
  /** Per metric: what the comparison would have used, what the service used, and the unit. `comparison - service` is the saved Fact's value. */
  metrics: Record<"water" | "energy" | "co2e", { label: string; comparison: number; service: number; unit: string }>;
  /** What the comparison would emit in delivery alone (0 for home washing), at the selected sensitivity. */
  comparisonDelivery: number;
  /** Net CO2e saving: the comparison total minus the service total. */
  netSaving: number;
  composition: { emissions: Part[]; /** Allocated textile waste by treatment: recycling, reuse, energy recovery, incineration. */ waste: Part[] | null };
};

/** The totals the footprint Facts use, laid out for charts: comparison against service per metric, the CO2e waterfall and the two compositions. Null without washed kg or when the sensitivity level has no spread (T002 unset). */
export function footprintComparison(data: FootprintData & Pick<AppData, "wasteCircularity">, scope: OperationalScope, baseline: Baseline, sensitivity: Sensitivity = DEFAULT_SENSITIVITY): FootprintComparison | null {
  const t = totalsFor(data, scope, baseline);
  const t002 = TEAM_ASSUMPTIONS.sensitivitySpread.value;
  const k = sensitivity === "base" ? 1 : t002 === null ? null : sensitivity === "low" ? 1 - t002 : 1 + t002;
  if (t.kg === 0 || k === null) return null;
  const { baseline: b, laundry: l } = t;
  const comparisonCo2e = (b.process + b.delivery) * k;
  const serviceCo2e = l.process + l.delivery;
  const waste = wasteSplit(data, scope);
  return {
    scope: factScope(data, { customerId: scope.customerId }),
    period: scope.period,
    baseline: baseline.baseline_name,
    sensitivity,
    metrics: {
      water: { label: "Water", comparison: b.water * k, service: l.water, unit: "L" },
      energy: { label: "Energy", comparison: b.energy * k, service: l.energy, unit: "kWh" },
      co2e: { label: "Net CO2e", comparison: comparisonCo2e, service: serviceCo2e, unit: "kgCO2e" },
    },
    comparisonDelivery: b.delivery * k,
    netSaving: comparisonCo2e - serviceCo2e,
    composition: {
      emissions: [
        { label: "Process", value: l.process, unit: "kgCO2e" },
        { label: "Delivery", value: l.delivery, unit: "kgCO2e" },
      ],
      waste: waste && [
        { label: "Recycling", value: waste.recycling, unit: "kg" },
        { label: "Reuse", value: waste.reuse, unit: "kg" },
        { label: "Energy recovery", value: waste.energyRecovery, unit: "kg" },
        { label: "Incineration", value: waste.incineration, unit: "kg" },
      ],
    },
  };
}
