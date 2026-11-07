import { describe, expect, it } from "vitest";
import { baselineSchema, laundrySchema, laundryResourceSchema, repairSchema, serviceActivitySchema } from "@/lib/data/schemas";

const row = {
  month: "2025-01", customer_id: "CUST001", site_id: "S001", product_id: "P1002", laundry_id: "L001",
  repair_type: "BUTTON", repair_count: "9", repair_quotient_pct: "0.49",
  estimated_replacements_postponed: "9", product_footprint_kgco2e: "13.2",
  estimated_avoided_product_kgco2e: "118.8", data_status: "SYNTHETIC_ESTIMATE",
};

describe("repairSchema", () => {
  it("accepts a valid row and turns numbers into numbers", () => {
    const r = repairSchema.parse(row);
    expect(r.repair_count).toBe(9);
    expect(r.product_footprint_kgco2e).toBe(13.2);
  });
  it("rejects a non-numeric repair_count with a reason", () => {
    const r = repairSchema.safeParse({ ...row, repair_count: "abc" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toEqual(["repair_count"]);
  });
  it("rejects a blank number instead of reading it as 0", () => {
    expect(repairSchema.safeParse({ ...row, repair_count: "" }).success).toBe(false);
  });
  it("rejects a malformed month and a fractional count", () => {
    expect(repairSchema.safeParse({ ...row, month: "2025-13" }).success).toBe(false);
    expect(repairSchema.safeParse({ ...row, repair_count: "1.5" }).success).toBe(false);
  });
});

const sa = {
  month: "2025-01", customer_id: "CUST001", site_id: "S001", laundry_id: "L001", product_id: "P1002",
  active_wearers: "654", allocated_pieces: "723", active_assets_scanned: "629", washed_pieces: "1863",
  packed_pieces: "1851", washing_pct: "257.7", customer_washed_kg: "1155.1", service_requests: "1", data_status: "SYNTHETIC",
};

describe("serviceActivitySchema", () => {
  it("accepts a valid row and turns numbers into numbers", () => {
    const r = serviceActivitySchema.parse(sa);
    expect(r.active_wearers).toBe(654);
    expect(r.washing_pct).toBe(257.7);
  });
  it("rejects a blank number instead of reading it as 0", () => {
    expect(serviceActivitySchema.safeParse({ ...sa, active_wearers: "" }).success).toBe(false);
  });
  it("rejects an unknown column", () => {
    expect(serviceActivitySchema.safeParse({ ...sa, extra: "1" }).success).toBe(false);
  });
});

const laundryRow = {
  month: "2025-01", laundry_id: "L001", laundry_name: "Aurora", country: "Finland", washed_kg: "120569.0",
  energy_kwh_per_kg: "0.74", fresh_water_l_per_kg: "4.95", process_energy_kwh: "89233.8", fresh_water_l: "596277.9",
  process_emissions_kgco2e: "8031.0", delivery_emissions_kgco2e: "5681.1", data_status: "S",
};
describe("laundryResourceSchema", () => {
  it("accepts a valid row", () => expect(laundryResourceSchema.parse(laundryRow).washed_kg).toBe(120569));
  it("rejects a blank number", () => expect(laundryResourceSchema.safeParse({ ...laundryRow, washed_kg: "" }).success).toBe(false));
  it("rejects an unknown column", () => expect(laundryResourceSchema.safeParse({ ...laundryRow, extra: "x" }).success).toBe(false));
});

const laundriesRow = { laundry_id: "L001", laundry_name: "Aurora Helsinki WWS", country: "Finland", country_code: "FI", note: "n" };
describe("laundrySchema", () => {
  it("accepts a valid row", () => expect(laundrySchema.parse(laundriesRow).laundry_name).toBe("Aurora Helsinki WWS"));
  it("rejects a blank name", () => expect(laundrySchema.safeParse({ ...laundriesRow, laundry_name: "" }).success).toBe(false));
  it("rejects an unknown column", () => expect(laundrySchema.safeParse({ ...laundriesRow, extra: "x" }).success).toBe(false));
});

const baselineRow = {
  baseline_id: "B_LOCAL", baseline_name: "Outsourced local laundry", selection_status: "DEFAULT", water_l_per_kg: "9.5",
  energy_kwh_per_kg: "1.05", process_kgco2e_per_kg: "0.62", delivery_kgco2e_per_kg: "0.035", mixed_waste_share: "1", assumption_note: "n",
};
describe("baselineSchema", () => {
  it("accepts a valid row", () => expect(baselineSchema.parse(baselineRow).process_kgco2e_per_kg).toBe(0.62));
  it("rejects a blank number", () => expect(baselineSchema.safeParse({ ...baselineRow, water_l_per_kg: "" }).success).toBe(false));
  it("rejects an unknown column", () => expect(baselineSchema.safeParse({ ...baselineRow, extra: "x" }).success).toBe(false));
});
