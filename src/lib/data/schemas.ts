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

export type Repair = z.infer<typeof repairSchema>;
export type Site = z.infer<typeof siteSchema>;
export type Customer = z.infer<typeof customerSchema>;
export type Assumption = z.infer<typeof assumptionSchema>;

export type AppData = {
  repairs: Repair[];
  sites: Site[];
  customers: Customer[];
  assumptions: Assumption[];
};

/** Sheet name (as in data_dictionary.csv) to schema; the file is `<sheet lower-case>.csv`. */
export const SHEETS = {
  Repairs: { key: "repairs", schema: repairSchema },
  Sites: { key: "sites", schema: siteSchema },
  Customers: { key: "customers", schema: customerSchema },
  Assumptions: { key: "assumptions", schema: assumptionSchema },
} as const;
