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
export { onTimeCycleRate, percentageFacts, recyclingReuseShare, repairRateByProduct, wasteSplit } from "./percentage";
export { baselineShortName, DEFAULT_BASELINE_ID, DEFAULT_SENSITIVITY, footprintComparison, footprintFacts, footprintGroup, FOOTPRINT_GROUPS, SENSITIVITY_LEVELS } from "./footprint";
export type { Baseline, FootprintComparison, Sensitivity } from "./footprint";
export { DORMANT_SITE_TYPE_TIERS, TEAM_ASSUMPTIONS } from "./assumptions-config";
export type { TeamAssumption, TeamAssumptions } from "./assumptions-config";
export type { OperationalScope, SiteColumn, SiteColumnKey, SiteRow, SiteRows } from "./operational";
export { classifyGaps, dormantSignal, dormantStacks, monthsOf, overAllocationSignal, repairBand, repairSpikeSignal } from "./signals";
export type { BandMonth, DormantSite, DormantStack, RepairBandSite, OverAllocatedSite, RepairSpikeSite, SignalResult, SpikeMonth } from "./signals";
export { dataReadinessFacts } from "./readiness";
export { observations } from "./observations";
export type { Observation, ObservationSet, ObservationType } from "./observations";
export { factDelta } from "./delta";
export type { FactDelta } from "./delta";
export { monthlySeries, monthlySeriesBySite, overAllocationCutoffPercent, repairSpikeRule, SERIES_MEASURES, WINDOW_MONTHS } from "./series";
export type { MatrixCell, MatrixMeasure, MonthlySeries, SeriesMeasure, SeriesPoint, SeriesTrend, SiteMatrix, WindowMonths } from "./series";
