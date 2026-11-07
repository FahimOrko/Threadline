// Site drill-down (Slice 3, change 3b). Pure: the same Fact builders as the dashboard, with a site in the scope.
// Left out on purpose: delivery sites (always 1), recycling share (waste is allocated per laundry) and footprint (no site split in impactAllocation).
import type { AppData } from "@/lib/data/schemas";
import { requireValue, type Fact } from "./fact";
import { activeWearers, garmentsInCirculation, repairs, serviceRequests, serviceRequestsPer100Wearers, type OperationalScope } from "./operational";
import { replacementsPostponed } from "./replacements-postponed";
import { onTimeCycleRate, repairRateByProduct } from "./percentage";
import { avoidedPurchaseCost, build, costOfUnusedAllocation, garmentUtilization, garmentValueKeptInUse } from "./value";
import { TEAM_ASSUMPTIONS, type TeamAssumptions } from "./assumptions-config";

type SiteData = Pick<
  AppData,
  "sites" | "customers" | "assumptions" | "repairs" | "serviceActivity" | "products" | "cycleCounts" | "wasteCircularity" | "impactAllocation"
>;
export type SiteScope = OperationalScope & { siteId: string };

/** Full-year repairs over December garments in circulation x 100, all products. Null without garments (no Fact rather than 0 or NaN). */
export function repairsPer100Garments(data: SiteData, scope: OperationalScope): Fact | null {
  const garments = requireValue(garmentsInCirculation(data, scope));
  if (garments === 0) return null;
  const reps = requireValue(repairs(data, scope));
  return build(data, scope, {
    id: "repairs_per_100_garments",
    label: "Repairs per 100 garments (Dec)",
    value: (reps / garments) * 100,
    unit: "per 100 garments",
    methods: ["CALCULATED"],
    source: "SYNTHETIC",
    assumptionIds: [],
    confidence: "Not rated (no assumption applies)",
    formula: "repairs per 100 garments (Dec) = full-year repairs / December garments in circulation x 100, all products",
    inputs: [
      { label: "Repairs (full year)", value: reps, unit: "repairs" },
      { label: "Garments in circulation (Dec)", value: garments, unit: "pieces" },
      {
        label: "Note",
        note: true,
        value: "Counts repair events, so one garment can be repaired more than once and the value can exceed 100. Divides the full-year repair count by the December garments, so it is an approximation, not a rate for one period.",
      },
    ],
  });
}

/** The site's Facts in page order: operational, money and utilization, percentages. */
export function siteFacts(data: SiteData, scope: SiteScope, team: TeamAssumptions = TEAM_ASSUMPTIONS) {
  return {
    operational: [
      activeWearers(data, scope),
      garmentsInCirculation(data, scope),
      repairs(data, scope),
      replacementsPostponed(data, scope),
      serviceRequests(data, scope),
      serviceRequestsPer100Wearers(data, scope),
    ],
    value: [
      avoidedPurchaseCost(data, scope),
      garmentValueKeptInUse(data, scope),
      costOfUnusedAllocation(data, scope, team),
      garmentUtilization(data, scope),
    ],
    percentages: [onTimeCycleRate(data, scope), ...repairRateByProduct(data, scope)].filter((f): f is Fact => f !== null),
  };
}

export type SiteComparison = { id: string; title: string; site: Fact; customer: Fact };

/** Site against its customer for utilization (Dec) and repairs per 100 garments (Dec); a pair is left out when either side has no value. */
export function siteComparison(data: SiteData, scope: SiteScope): SiteComparison[] {
  const customerScope = { customerId: scope.customerId, period: scope.period };
  const pair = (id: string, title: string, make: (s: OperationalScope) => Fact | null): SiteComparison[] => {
    const site = make(scope);
    const customer = make(customerScope);
    if (!site || !customer) return [];
    return [
      { id, title, site: { ...site, label: `${site.label}, this site` }, customer: { ...customer, label: `${customer.label}, all ${customer.scope.customerName} sites` } },
    ];
  };
  return [
    ...pair("garment_utilization", "Garment utilization (Dec)", (s) => garmentUtilization(data, s)),
    ...pair("repairs_per_100_garments", "Repairs per 100 garments (Dec)", (s) => repairsPer100Garments(data, s)),
  ];
}
