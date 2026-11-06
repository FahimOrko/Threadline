// Static import of the build output. Import this only from server components (ADR 0002, spec: dashboard-kpis).
import assumptions from "../../../data/generated/assumptions.json";
import customers from "../../../data/generated/customers.json";
import repairs from "../../../data/generated/repairs.json";
import sites from "../../../data/generated/sites.json";
import { jsonDataSource } from "./source";

export const generatedSource = jsonDataSource({ repairs, sites, customers, assumptions });
