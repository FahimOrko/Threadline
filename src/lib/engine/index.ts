export { requireValue } from "./fact";
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
export { TEAM_ASSUMPTIONS } from "./assumptions-config";
export type { TeamAssumption, TeamAssumptions } from "./assumptions-config";
export type { OperationalScope, SiteColumn, SiteColumnKey, SiteRow, SiteRows } from "./operational";
