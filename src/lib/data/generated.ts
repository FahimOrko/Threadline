// Static import of the build output. Import this only from server components (ADR 0002, spec: dashboard-kpis).
import assumptions from "../../../data/generated/assumptions.json";
import cycleCounts from "../../../data/generated/cycleCounts.json";
import baselines from "../../../data/generated/baselines.json";
import customers from "../../../data/generated/customers.json";
import impactAllocation from "../../../data/generated/impactAllocation.json";
import laundries from "../../../data/generated/laundries.json";
import laundryResources from "../../../data/generated/laundryResources.json";
import products from "../../../data/generated/products.json";
import repairs from "../../../data/generated/repairs.json";
import serviceActivity from "../../../data/generated/serviceActivity.json";
import sites from "../../../data/generated/sites.json";
import wasteCircularity from "../../../data/generated/wasteCircularity.json";
import { jsonDataSource } from "./source";

export const generatedSource = jsonDataSource({ repairs, sites, customers, assumptions, serviceActivity, products, cycleCounts, wasteCircularity, impactAllocation, laundryResources, laundries, baselines });
