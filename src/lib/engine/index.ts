export { factScope, inScope, requireValue } from "./fact";
export { repairsPer100Garments, siteComparison, siteFacts } from "./site";
export type { SiteComparison, SiteScope } from "./site";
export type { Fact, Period } from "./fact";
export { replacementsPostponed } from "./replacements-postponed";
export {
  activeWearers,
  deliverySites,
  garmentsInCirculation,
  operationalFacts,
  operationalSiteRows,
  repairs,
  serviceRequests,
  serviceRequestsPer100Wearers,
} from "./operational";
export {
  avoidedPurchaseCost,
  costOfUnusedAllocation,
  garmentUtilization,
  garmentValueKeptInUse,
  productCost,
  teamAssumptionInputs,
  valueFacts,
} from "./value";
export { onTimeCycleRate, percentageFacts, recyclingReuseShare, repairRateByProduct } from "./percentage";
export { baselineShortName, DEFAULT_BASELINE_ID, DEFAULT_SENSITIVITY, footprintFacts, footprintGroup, FOOTPRINT_GROUPS, SENSITIVITY_LEVELS } from "./footprint";
export type { Baseline, Sensitivity } from "./footprint";
export { TEAM_ASSUMPTIONS } from "./assumptions-config";
export type { TeamAssumption, TeamAssumptions } from "./assumptions-config";
export type { OperationalScope, SiteColumn, SiteColumnKey, SiteRow, SiteRows } from "./operational";
