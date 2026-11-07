// Row schemas for the sheets the pipeline reads. Values are validated, never coerced from blanks.
import { z } from "zod";

const text = z.string().min(1);
// z.coerce.number() turns "" into 0, so parse explicitly.
const num = z.string().min(1).transform(Number).pipe(z.number().finite());
const count = num.pipe(z.number().int().min(0));
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "month must be YYYY-MM");

export const repairSchema = z.strictObject({
  month,
  customer_id: text,
  site_id: text,
  product_id: text,
  laundry_id: text,
  repair_type: text,
  repair_count: count,
  repair_quotient_pct: num,
  estimated_replacements_postponed: count,
  product_footprint_kgco2e: num,
  estimated_avoided_product_kgco2e: num,
  data_status: text,
});

export const siteSchema = z.strictObject({
  site_id: text,
  customer_id: text,
  site_name: text,
  country: text,
  city: text,
  site_type: text,
  primary_laundry_id: text,
  data_status: text,
});

export const customerSchema = z.strictObject({
  customer_id: text,
  customer_name: text,
  industry: text,
  segment: text,
  hq_country: text,
  priority_topics: text,
  data_status: text,
});

export const assumptionSchema = z.strictObject({
  assumption_id: text,
  assumption: text,
  value_or_rule: text,
  rationale: text,
  category: text,
  confidence: text,
  treatment: text,
});

export const serviceActivitySchema = z.strictObject({
  month,
  customer_id: text,
  site_id: text,
  laundry_id: text,
  product_id: text,
  active_wearers: count,
  allocated_pieces: count,
  active_assets_scanned: count,
  washed_pieces: count,
  packed_pieces: count,
  // Loaded but unused: mostly above 100% and its definition is unclear. Keep it out of claims until Lindström confirms.
  washing_pct: num,
  customer_washed_kg: num,
  service_requests: count,
  data_status: text,
});

export const productSchema = z.strictObject({
  product_id: text,
  product_name: text,
  product_group: text,
  avg_weight_kg: num,
  synthetic_product_footprint_kgco2e: num,
  synthetic_purchase_cost_eur: num,
  material_note: text,
});

export const serviceCycleSchema = z.strictObject({
  asset_id: text,
  cycle_number: count,
  customer_id: text,
  site_id: text,
  laundry_id: text,
  product_id: text,
  pickup_timestamp: text,
  in_laundry_timestamp: text,
  out_laundry_timestamp: text,
  delivered_timestamp: text,
  cycle_hours: num,
  performance_flag: z.enum(["ON_TIME", "LATE"]),
  data_status: text,
});

export const wasteCircularitySchema = z.strictObject({
  month,
  laundry_id: text,
  recycling_kg: num,
  reuse_kg: num,
  energy_recovery_kg: num,
  incineration_kg: num,
  textile_waste_total_kg: num,
  waste_kg_per_washed_kg: num,
  data_status: text,
});

export const customerImpactSchema = z.strictObject({
  month,
  customer_id: text,
  site_id: text,
  laundry_id: text,
  product_id: text,
  customer_washed_kg: num,
  share_of_laundry_washed_kg: num,
  allocated_water_l: num,
  allocated_energy_kwh: num,
  allocated_process_kgco2e: num,
  allocated_delivery_kgco2e: num,
  allocated_textile_waste_kg: num,
  water_saving_vs_local_l: num,
  energy_saving_vs_local_kwh: num,
  emissions_saving_vs_local_kgco2e: num,
  data_status: text,
});

export const laundryResourceSchema = z.strictObject({
  month,
  laundry_id: text,
  laundry_name: text,
  country: text,
  washed_kg: num,
  energy_kwh_per_kg: num,
  fresh_water_l_per_kg: num,
  process_energy_kwh: num,
  fresh_water_l: num,
  process_emissions_kgco2e: num,
  delivery_emissions_kgco2e: num,
  data_status: text,
});

export const laundrySchema = z.strictObject({
  laundry_id: text,
  laundry_name: text,
  country: text,
  country_code: text,
  note: text,
});

export const baselineSchema = z.strictObject({
  baseline_id: text,
  baseline_name: text,
  selection_status: text,
  water_l_per_kg: num,
  energy_kwh_per_kg: num,
  process_kgco2e_per_kg: num,
  delivery_kgco2e_per_kg: num,
  mixed_waste_share: num,
  assumption_note: text,
});

/** The baseline the dashboard compares against (assumption A001) when `?baseline=` is absent or unknown. */
export const DEFAULT_BASELINE_ID = "B_LOCAL";

export type Repair = z.infer<typeof repairSchema>;
export type Site = z.infer<typeof siteSchema>;
export type ServiceActivity = z.infer<typeof serviceActivitySchema>;
export type Product = z.infer<typeof productSchema>;
export type ServiceCycle = z.infer<typeof serviceCycleSchema>;
export type WasteCircularity = z.infer<typeof wasteCircularitySchema>;
export type CustomerImpact = z.infer<typeof customerImpactSchema>;
export type LaundryResource = z.infer<typeof laundryResourceSchema>;
export type Laundry = z.infer<typeof laundrySchema>;
export type Baseline = z.infer<typeof baselineSchema>;
/** Build-time aggregate of service_cycles: raw cycles never reach the browser. */
export type CycleCount = { customer_id: string; site_id: string; cycles: number; on_time: number };
/** Build-time aggregate of service_cycles: per site, how many pickup gaps (whole days between an asset's consecutive pickups) had each length. Tiers are applied in the engine, never here. */
export type PickupGaps = { customer_id: string; site_id: string; gaps: Record<string, number> };
/** Build-time aggregate of customer_impacts: the customer's washed kg and allocated waste per laundry-month. */
export type ImpactAllocation = { customer_id: string; laundry_id: string; month: string; customer_washed_kg: number; allocated_textile_waste_kg: number };
export type Customer = z.infer<typeof customerSchema>;
export type Assumption = z.infer<typeof assumptionSchema>;

export type AppData = {
  repairs: Repair[];
  sites: Site[];
  customers: Customer[];
  assumptions: Assumption[];
  serviceActivity: ServiceActivity[];
  products: Product[];
  cycleCounts: CycleCount[];
  pickupGaps: PickupGaps[];
  wasteCircularity: WasteCircularity[];
  impactAllocation: ImpactAllocation[];
  laundryResources: LaundryResource[];
  laundries: Laundry[];
  baselines: Baseline[];
};

/** Sheet name (as in data_dictionary.csv) to schema; the file is `<sheet lower-case>.csv`. */
export const SHEETS = {
  Repairs: { key: "repairs", schema: repairSchema },
  Sites: { key: "sites", schema: siteSchema },
  Customers: { key: "customers", schema: customerSchema },
  Assumptions: { key: "assumptions", schema: assumptionSchema },
  Service_Activity: { key: "serviceActivity", schema: serviceActivitySchema },
  Products: { key: "products", schema: productSchema },
  Service_Cycles: { key: "serviceCycles", schema: serviceCycleSchema },
  Waste_Circularity: { key: "wasteCircularity", schema: wasteCircularitySchema },
  Customer_Impacts: { key: "customerImpacts", schema: customerImpactSchema },
  Laundry_Resources: { key: "laundryResources", schema: laundryResourceSchema },
  Baselines: { key: "baselines", schema: baselineSchema },
  Laundries: { key: "laundries", schema: laundrySchema },
} as const;
