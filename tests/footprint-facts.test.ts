import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildData } from "@/lib/data/pipeline";
import { DEFAULT_BASELINE_ID, footprintFacts, footprintGroup, requireValue, type Baseline, type Sensitivity } from "@/lib/engine";

const stems = ["data_dictionary", "repairs", "sites", "customers", "assumptions", "service_activity", "products", "service_cycles", "waste_circularity", "customer_impacts", "laundry_resources", "baselines", "laundries"];
const { data } = buildData(Object.fromEntries(stems.map((s) => [s, readFileSync(`data/raw/${s}.csv`, "utf8")])));
const period = { from: "2025-01", to: "2025-12" };
const scope = (customerId: string) => ({ customerId, period });
const local = data.baselines.find((b) => b.baseline_id === DEFAULT_BASELINE_ID)!;
const home = data.baselines.find((b) => b.baseline_id === "B_HOME")!;

// Independent recomputation straight from the CSVs, not through the pipeline or the engine.
const csv = (name: string) => {
  const [head, ...lines] = readFileSync(`data/raw/${name}.csv`, "utf8").trim().split("\n");
  const cols = head.split(",");
  return lines.map((l) => Object.fromEntries(l.split(",").map((v, i) => [cols[i], v])));
};
const impacts = csv("customer_impacts");
const laundries = csv("laundry_resources");

function expected(customer: string, b: Baseline) {
  let kg = 0, water = 0, energy = 0, co2e = 0, process = 0, delivery = 0, baseCo2e = 0, baseWater = 0, baseEnergy = 0;
  for (const r of impacts.filter((x) => x.customer_id === customer)) {
    const l = laundries.find((x) => x.laundry_id === r.laundry_id && x.month === r.month)!;
    const k = Number(r.customer_washed_kg);
    const lk = Number(l.washed_kg);
    kg += k;
    water += k * Number(l.fresh_water_l_per_kg);
    energy += k * Number(l.energy_kwh_per_kg);
    process += (k * Number(l.process_emissions_kgco2e)) / lk;
    delivery += (k * Number(l.delivery_emissions_kgco2e)) / lk;
    baseWater += k * b.water_l_per_kg;
    baseEnergy += k * b.energy_kwh_per_kg;
    baseCo2e += k * (b.process_kgco2e_per_kg + b.delivery_kgco2e_per_kg);
  }
  co2e = process + delivery;
  return { kg, waterSaved: baseWater - water, energySaved: baseEnergy - energy, co2eSaved: baseCo2e - co2e, waterPct: ((baseWater - water) / baseWater) * 100, energyPct: ((baseEnergy - energy) / baseEnergy) * 100, co2ePct: ((baseCo2e - co2e) / baseCo2e) * 100, service: co2e, delivery };
}
const byId = (customer: string, b: Baseline = local, level: Sensitivity = "base") => Object.fromEntries(footprintFacts(data, scope(customer), b, level).map((f) => [f.id, f]));
const SAVED = ["water_saved", "water_saved_pct", "energy_saved", "energy_saved_pct", "co2e_saved", "co2e_saved_pct"];
const NOT_SAVED = ["service_footprint", "service_footprint_per_tonne", "service_footprint_per_wearer", "delivery_footprint", "delivery_share"];
const baselines = data.baselines;
const levels = ["low", "base", "high"] as const;

describe("footprintFacts", () => {
  for (const customer of ["CUST001", "CUST002"]) {
    it(`${customer}: every value matches the independent recomputation`, () => {
      const e = expected(customer, local);
      const f = byId(customer);
      expect(requireValue(f.water_saved)).toBeCloseTo(e.waterSaved, 3);
      expect(requireValue(f.energy_saved)).toBeCloseTo(e.energySaved, 3);
      expect(requireValue(f.co2e_saved)).toBeCloseTo(e.co2eSaved, 3);
      expect(requireValue(f.water_saved_pct)).toBeCloseTo(e.waterPct, 6);
      expect(requireValue(f.energy_saved_pct)).toBeCloseTo(e.energyPct, 6);
      expect(requireValue(f.co2e_saved_pct)).toBeCloseTo(e.co2ePct, 6);
      expect(requireValue(f.service_footprint)).toBeCloseTo(e.service, 3);
      expect(requireValue(f.service_footprint_per_tonne)).toBeCloseTo(e.service / (e.kg / 1000), 6);
      expect(requireValue(f.delivery_footprint)).toBeCloseTo(e.delivery, 3);
      expect(requireValue(f.delivery_share)).toBeCloseTo((e.delivery / e.service) * 100, 6);
    });
  }

  it("NorthStar matches the proposal's Done when list", () => {
    const f = byId("CUST001");
    expect(Math.round(requireValue(f.water_saved))).toBe(1406483);
    expect(Math.round(requireValue(f.energy_saved))).toBe(171643);
    expect(Math.round(requireValue(f.co2e_saved))).toBe(255074);
    expect(requireValue(f.water_saved_pct)).toBeCloseTo(29.5, 1);
    expect(requireValue(f.energy_saved_pct)).toBeCloseTo(32.6, 1);
    expect(requireValue(f.co2e_saved_pct)).toBeCloseTo(77.6, 1);
    expect(Math.round(requireValue(f.service_footprint))).toBe(73785);
    expect(Math.round(requireValue(f.service_footprint_per_tonne))).toBe(147);
    expect(requireValue(f.service_footprint_per_wearer)).toBeCloseTo(7.7, 1);
    expect(Math.round(requireValue(f.delivery_footprint))).toBe(23785);
    expect(requireValue(f.delivery_share)).toBeCloseTo(32.2, 1);
  });

  it("service and delivery Facts have range base = value, empty low and high, and a value", () => {
    const f = byId("CUST001");
    for (const id of NOT_SAVED) {
      expect(f[id].value).not.toBeNull();
      expect(f[id].range).toEqual({ low: null, base: f[id].value, high: null });
    }
  });

  it("savings Facts carry low < base < high", () => {
    const f = byId("CUST001");
    for (const id of SAVED) expect(f[id].range.low! < f[id].range.base! && f[id].range.base! < f[id].range.high!).toBe(true);
  });

  it("savings: ALLOCATED + ESTIMATED, SYNTHETIC, A001, baseline in the label; footprints: no assumption", () => {
    const f = byId("CUST001");
    for (const id of ["water_saved", "water_saved_pct", "energy_saved", "energy_saved_pct", "co2e_saved", "co2e_saved_pct"]) {
      expect(f[id]).toMatchObject({ methods: ["ALLOCATED", "ESTIMATED"], source: "SYNTHETIC", assumptionIds: ["A001"], baseline: local.baseline_name });
      expect(f[id].label).toContain("vs local laundry");
    }
    for (const id of ["service_footprint", "service_footprint_per_tonne", "service_footprint_per_wearer", "delivery_footprint", "delivery_share"]) {
      expect(f[id]).toMatchObject({ source: "SYNTHETIC", assumptionIds: [] });
      expect(f[id].methods).toContain("ALLOCATED");
    }
    expect(f.service_footprint_per_tonne.unit).toBe("kgCO2e/t");
    expect(f.service_footprint_per_wearer.label).toContain("(Dec)");
  });

  it("CO2e saved carries the illustrative-baseline note, water and energy do not", () => {
    const f = byId("CUST001");
    for (const id of ["co2e_saved", "co2e_saved_pct"]) expect(f[id].inputs.find((i) => i.label === "Baseline note")!.value).toMatch(/illustrative.*far above the laundries/);
    expect(f.water_saved.inputs.some((i) => i.label === "Baseline note")).toBe(false);
  });

  it("delivery Facts list both delivery factors, the net-comparison note and the route-km data gap", () => {
    const f = byId("CUST001");
    for (const id of ["delivery_footprint", "delivery_share"]) {
      const labels = f[id].inputs.map((i) => i.label);
      expect(labels).toContain("Laundry delivery factor (kg-weighted)");
      expect(labels).toContain("Baseline delivery factor (B_LOCAL)");
      const notes = f[id].inputs.filter((i) => i.note).map((i) => String(i.value));
      expect(notes.some((n) => n.includes("zero delivery") && n.includes("net CO2e saved"))).toBe(true);
      expect(notes.some((n) => n.includes("Route kilometres are not in the data pack"))).toBe(true);
    }
  });

  it("a different baseline row changes values and labels", () => {
    const e = expected("CUST001", home);
    const f = byId("CUST001", home);
    expect(requireValue(f.co2e_saved)).toBeCloseTo(e.co2eSaved, 3);
    expect(f.co2e_saved.label).toContain("vs home washing");
    expect(f.co2e_saved.baseline).toBe(home.baseline_name);
    expect(requireValue(f.co2e_saved)).not.toBeCloseTo(requireValue(byId("CUST001").co2e_saved), 0);
  });

  for (const b of baselines) {
    const short = { B_LOCAL: "local laundry", B_HOME: "home washing", B_INHOUSE: "in-house laundry" }[b.baseline_id]!;
    for (const level of levels) {
      it(`${b.baseline_id} at ${level}: values equal the saving with baseline factors scaled, labels name the baseline`, () => {
        const k = { low: 0.8, base: 1, high: 1.2 }[level];
        const scaled = { ...b, water_l_per_kg: b.water_l_per_kg * k, energy_kwh_per_kg: b.energy_kwh_per_kg * k, process_kgco2e_per_kg: b.process_kgco2e_per_kg * k, delivery_kgco2e_per_kg: b.delivery_kgco2e_per_kg * k };
        const e = expected("CUST001", scaled);
        const f = byId("CUST001", b, level);
        expect(requireValue(f.water_saved)).toBeCloseTo(e.waterSaved, 3);
        expect(requireValue(f.energy_saved)).toBeCloseTo(e.energySaved, 3);
        expect(requireValue(f.co2e_saved)).toBeCloseTo(e.co2eSaved, 3);
        expect(requireValue(f.co2e_saved_pct)).toBeCloseTo(e.co2ePct, 6);
        for (const id of SAVED) {
          expect(f[id].label).toContain(`vs ${short}`);
          expect(f[id].value).toBe(f[id].range[level]);
          expect(f[id].range).toEqual(byId("CUST001", b, "base")[id].range);
        }
        expect(f.co2e_saved.source).toBe(level === "base" ? "SYNTHETIC" : "ASSUMPTION");
        expect(f.co2e_saved.assumptionIds).toEqual(level === "base" ? ["A001"] : ["A001", "T002"]);
        expect(f.co2e_saved.inputs.some((i) => i.label.startsWith("T002"))).toBe(true);
      });
    }

    it(`${b.baseline_id}: service and delivery Facts do not change with sensitivity`, () => {
      const base = byId("CUST001", b, "base");
      for (const level of ["low", "high"] as const) {
        const f = byId("CUST001", b, level);
        for (const id of NOT_SAVED) expect(f[id]).toEqual(base[id]);
      }
    });

    it(`${b.baseline_id}: net CO2e saved stays in the delivery group with the net-comparison note`, () => {
      for (const level of levels) {
        const facts = footprintFacts(data, scope("CUST001"), b, level);
        const group = footprintGroup(facts, "delivery");
        expect(group.map((x) => x.id)).toEqual(["delivery_footprint", "delivery_share", "co2e_saved"]);
        const note = group[0].inputs.filter((i) => i.note).map((i) => String(i.value));
        expect(note.some((n) => n.includes("zero delivery") && n.includes("net CO2e saved"))).toBe(true);
      }
    });
  }

  it("home washing has a zero delivery baseline factor at every level", () => {
    for (const level of levels) {
      const f = byId("CUST001", home, level);
      expect(f.delivery_footprint.inputs.find((i) => i.label.startsWith("Baseline delivery factor"))!.value).toBe(0);
    }
  });

  it("falls back to the sheet name for an unmapped baseline id", () => {
    const f = byId("CUST001", { ...local, baseline_id: "B_X", baseline_name: "Some baseline" });
    expect(f.water_saved.label).toBe("Water saved vs Some baseline");
  });

  it("groups hold the net CO2e Fact in both the saved and delivery groups", () => {
    const facts = footprintFacts(data, scope("CUST001"), local);
    expect(footprintGroup(facts, "saved").map((f) => f.id)).toContain("co2e_saved");
    expect(footprintGroup(facts, "delivery").map((f) => f.id)).toEqual(["delivery_footprint", "delivery_share", "co2e_saved"]);
    expect(footprintGroup(facts, "service")).toHaveLength(3);
  });

  it("returns no Facts without washed kg", () => expect(footprintFacts(data, scope("CUST999"), local)).toEqual([]));

  it("omits the per-wearer Fact without December wearers instead of dividing by zero", () => {
    const no = { ...data, serviceActivity: data.serviceActivity.filter((r) => r.month !== "2025-12") };
    const f = Object.fromEntries(footprintFacts(no, scope("CUST001"), local).map((x) => [x.id, x]));
    expect(f.service_footprint_per_wearer).toBeUndefined();
    expect(f.service_footprint).toBeDefined();
  });

  it("throws naming the laundry-month when data bypassed the build", () => {
    const broken = { ...data, laundryResources: data.laundryResources.filter((l) => !(l.laundry_id === "L001" && l.month === "2025-03")) };
    expect(() => footprintFacts(broken, scope("CUST001"), local)).toThrow(/L001 in 2025-03/);
  });
});

// Reported, never forced: a failure prints both numbers.
describe("engine totals vs the pack's precomputed columns", () => {
  const sumCol = (customer: string, col: string) => impacts.filter((r) => r.customer_id === customer).reduce((s, r) => s + Number(r[col]), 0);
  for (const c of data.customers.map((x) => x.customer_id)) {
    it(`${c}: savings and allocated footprint agree within 0.1%`, () => {
      const f = byId(c);
      const pairs: [string, number, number][] = [
        ["water saved", requireValue(f.water_saved), sumCol(c, "water_saving_vs_local_l")],
        ["energy saved", requireValue(f.energy_saved), sumCol(c, "energy_saving_vs_local_kwh")],
        ["co2e saved", requireValue(f.co2e_saved), sumCol(c, "emissions_saving_vs_local_kgco2e")],
        ["service footprint", requireValue(f.service_footprint), sumCol(c, "allocated_process_kgco2e") + sumCol(c, "allocated_delivery_kgco2e")],
        ["delivery", requireValue(f.delivery_footprint), sumCol(c, "allocated_delivery_kgco2e")],
      ];
      for (const [name, engine, pack] of pairs) {
        const diff = Math.abs(engine - pack) / Math.abs(pack);
        expect(diff, `${c} ${name}: engine ${engine}, pack ${pack}`).toBeLessThan(0.001);
      }
    });
  }
});
