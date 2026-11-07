// Garment signals (Slice 5): dormant garments, over-allocation and repair spikes. Pure: data in, Facts out.
// Thresholds are team assumptions T003 to T010 (ADR 0018); the pipeline only ships the pickup-gap histogram.
import type { AppData } from "@/lib/data/schemas";
import { DORMANT_SITE_TYPE_TIERS, TEAM_ASSUMPTIONS, type TeamAssumptions } from "./assumptions-config";
import { requireValue, type Fact } from "./fact";
import type { OperationalScope } from "./operational";
import { build, garmentUtilization, teamAssumptionInputs } from "./value";
import { garmentsInCirculation } from "./operational";

type SignalData = Pick<AppData, "sites" | "customers" | "assumptions" | "repairs" | "serviceActivity" | "products" | "pickupGaps">;
type Scope = Omit<OperationalScope, "siteId">;

export type DormantSite = { siteId: string; siteName: string; siteType: string; gaps: number; watch: number; risk: number; critical: number };
export type SignalResult<S> = { fact: Fact; sites: S[] };

const customerSites = (data: SignalData, scope: Scope) => data.sites.filter((s) => s.customer_id === scope.customerId);
const NO_ASSUMPTION_CONFIDENCE = "Assumed";
const list = (xs: string[]) => (xs.length === 0 ? "none" : xs.join("; "));

/** Counts of gaps above each tier boundary: watch counts every gap above the Watch days (so it includes Risk and Critical). */
export function classifyGaps(gaps: Record<string, number>, tiers: { watch: number; risk: number; critical: number | null }) {
  const over = (days: number) => Object.entries(gaps).reduce((s, [d, n]) => (Number(d) > days ? s + n : s), 0);
  return { gaps: Object.values(gaps).reduce((s, n) => s + n, 0), watch: over(tiers.watch), risk: over(tiers.risk), critical: tiers.critical === null ? 0 : over(tiers.critical) };
}

/** Dormant garments per site, by the site's tier row. A site is flagged when it has Critical gaps; sites with an unmapped type are listed as not classified. Site level only, never per person. */
export function dormantSignal(data: SignalData, scope: Scope, team: TeamAssumptions = TEAM_ASSUMPTIONS): SignalResult<DormantSite> & { notClassified: { siteId: string; siteName: string; siteType: string }[]; all: DormantSite[] } {
  const all: DormantSite[] = [];
  const notClassified: { siteId: string; siteName: string; siteType: string }[] = [];
  for (const s of customerSites(data, scope)) {
    const key = DORMANT_SITE_TYPE_TIERS.map[s.site_type];
    if (!key) {
      notClassified.push({ siteId: s.site_id, siteName: s.site_name, siteType: s.site_type });
      continue;
    }
    const gaps = data.pickupGaps.find((g) => g.customer_id === scope.customerId && g.site_id === s.site_id)?.gaps ?? {};
    all.push({ siteId: s.site_id, siteName: s.site_name, siteType: s.site_type, ...classifyGaps(gaps, team[key].tiers!) });
  }
  const sites = all.filter((s) => s.critical > 0).sort((a, b) => b.critical - a.critical || a.siteId.localeCompare(b.siteId));
  const tierRows = (["dormantTierStrict", "dormantTierMid", "dormantTierLoose"] as const).map((k) => {
    const t = team[k];
    return { label: `${t.id} dormant tier row`, value: `Watch above ${t.tiers!.watch}, Risk above ${t.tiers!.risk}, Critical ${t.tiers!.critical === null ? "none" : `above ${t.tiers!.critical}`} (days)` };
  });
  const fact = build(data, scope, {
    id: "dormant_critical_sites",
    label: "Sites with Critical dormant garments",
    value: sites.length,
    unit: "sites",
    methods: ["CALCULATED"],
    source: "ASSUMPTION",
    assumptionIds: [team.dormantTierStrict.id, team.dormantTierMid.id, team.dormantTierLoose.id, DORMANT_SITE_TYPE_TIERS.id],
    confidence: NO_ASSUMPTION_CONFIDENCE,
    formula: "sites with Critical dormant garments = count of sites with at least one pickup gap above the Critical days of the site's tier row; gap = days between an asset's consecutive pickups, sorted by pickup timestamp",
    inputs: [
      { label: "Sites classified", value: all.length, unit: "sites" },
      ...sites.map((s) => ({ label: s.siteName, value: `${s.critical} Critical, ${s.risk} Risk or worse, ${s.watch} Watch or worse, of ${s.gaps} gaps` })),
      { label: "Not classified (site type not in T006)", value: list(notClassified.map((s) => `${s.siteName} (${s.siteType})`)) },
      ...tierRows,
      { label: `${DORMANT_SITE_TYPE_TIERS.id} site type to tier row`, value: Object.entries(DORMANT_SITE_TYPE_TIERS.map).map(([t, k]) => `${t}: ${team[k].id}`).join("; ") },
      { label: "Period", note: true, value: "Gaps cover all of 2025 and are not clipped to the period. They are counted per site, never per person. A dormant garment is a site-level hygiene and availability discussion point, not compliance advice." },
    ],
  });
  return { fact, sites, notClassified, all };
}

export type OverAllocatedSite = { siteId: string; siteName: string; utilization: number };

/** Sites whose utilization in the last month of the period is below T007. A site without allocated pieces is skipped. */
export function overAllocationSignal(data: SignalData, scope: Scope, team: TeamAssumptions = TEAM_ASSUMPTIONS): SignalResult<OverAllocatedSite> {
  const cutoff = team.overAllocationCutoff;
  const sites: OverAllocatedSite[] = [];
  for (const s of customerSites(data, scope)) {
    const sc = { ...scope, siteId: s.site_id };
    if (requireValue(garmentsInCirculation(data, sc)) === 0) continue;
    const utilization = requireValue(garmentUtilization(data, sc));
    if (utilization / 100 < cutoff.value!) sites.push({ siteId: s.site_id, siteName: s.site_name, utilization });
  }
  sites.sort((a, b) => a.utilization - b.utilization);
  const fact = build(data, scope, {
    id: "over_allocated_sites",
    label: "Over-allocated sites",
    value: sites.length,
    unit: "sites",
    methods: ["CALCULATED"],
    source: "ASSUMPTION",
    assumptionIds: [cutoff.id],
    confidence: NO_ASSUMPTION_CONFIDENCE,
    formula: `over-allocated sites = count of sites whose utilization for ${scope.period.to} (active_assets_scanned / allocated_pieces) is below the ${cutoff.id} cut-off`,
    inputs: [
      ...sites.map((s) => ({ label: s.siteName, value: s.utilization, unit: "%" })),
      ...teamAssumptionInputs("over-allocation cut-off", cutoff),
    ],
  });
  return { fact, sites };
}

export type SpikeMonth = { month: string; repairs: number; mean: number };
export type RepairSpikeSite = { siteId: string; siteName: string; spikes: SpikeMonth[] };

export function monthsOf(from: string, to: string): string[] {
  const out: string[] = [];
  let [y, m] = from.split("-").map(Number);
  while (`${y}-${String(m).padStart(2, "0")}` <= to) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return out;
}

export type BandMonth = { month: string; repairs: number; /** Mean of the trailing window; null until the window has enough history. */ mean: number | null; /** Repairs at which the month counts as a spike; null with the mean. */ threshold: number | null; spike: boolean };
export type RepairBandSite = { siteId: string; siteName: string; months: BandMonth[] };

/** Monthly repairs per site with the spike rule's mean, threshold and flag. The one place the rule is applied: `repairSpikeSignal` filters this. */
export function repairBand(data: SignalData, scope: Scope, team: TeamAssumptions = TEAM_ASSUMPTIONS): RepairBandSite[] {
  const { repairSpikeRatio: ratio, repairSpikeWindow: window, repairSpikeMinIncrease: floor } = team;
  const months = monthsOf(scope.period.from, scope.period.to);
  return customerSites(data, scope).map((s) => {
    const byMonth = new Map<string, number>();
    for (const r of data.repairs) if (r.customer_id === scope.customerId && r.site_id === s.site_id) byMonth.set(r.month, (byMonth.get(r.month) ?? 0) + r.repair_count);
    return {
      siteId: s.site_id,
      siteName: s.site_name,
      months: months.map((month, i): BandMonth => {
        const repairs = byMonth.get(month) ?? 0;
        if (i < window.value!) return { month, repairs, mean: null, threshold: null, spike: false };
        const mean = months.slice(i - window.value!, i).reduce((t, m) => t + (byMonth.get(m) ?? 0), 0) / window.value!;
        // A spike needs both T008 x mean and T010 above the mean, so the line is the higher of the two.
        const threshold = Math.max(ratio.value! * mean, mean + floor.value!);
        return { month, repairs, mean, threshold, spike: repairs >= ratio.value! * mean && repairs - mean >= floor.value! };
      }),
    };
  });
}

/** Sites with a month whose repairs (all products) are at least T008 times the mean of the T009 months before it and at least T010 above that mean. Months without T009 months of history in the period are not tested. */
export function repairSpikeSignal(data: SignalData, scope: Scope, team: TeamAssumptions = TEAM_ASSUMPTIONS): SignalResult<RepairSpikeSite> {
  const { repairSpikeRatio: ratio, repairSpikeWindow: window, repairSpikeMinIncrease: floor } = team;
  const sites: RepairSpikeSite[] = [];
  for (const b of repairBand(data, scope, team)) {
    const spikes: SpikeMonth[] = b.months.filter((m) => m.spike).map((m) => ({ month: m.month, repairs: m.repairs, mean: m.mean! }));
    if (spikes.length > 0) sites.push({ siteId: b.siteId, siteName: b.siteName, spikes });
  }
  const fact = build(data, scope, {
    id: "repair_spike_sites",
    label: "Sites with a repair spike",
    value: sites.length,
    unit: "sites",
    methods: ["CALCULATED"],
    source: "ASSUMPTION",
    assumptionIds: [ratio.id, window.id, floor.id],
    confidence: NO_ASSUMPTION_CONFIDENCE,
    formula: `repair spike = a month with repairs (all products) at least ${ratio.id} x the mean of the previous ${window.id} months and at least ${floor.id} repairs above that mean`,
    inputs: [
      ...sites.map((s) => ({ label: s.siteName, value: s.spikes.map((p) => `${p.month}: ${p.repairs} repairs vs mean ${Math.round(p.mean * 10) / 10}`).join("; ") })),
      ...teamAssumptionInputs("spike ratio", ratio),
      ...teamAssumptionInputs("trailing window", window),
      ...teamAssumptionInputs("minimum increase", floor),
    ],
  });
  return { fact, sites };
}

export type DormantStack = { siteId: string; siteName: string; /** Gaps in the Watch tier only. */ watch: number; /** Gaps in the Risk tier only. */ risk: number; critical: number };

/** The tiers as stacked, non-overlapping counts (`classifyGaps` counts every gap above a boundary, so each tier includes the ones above it). */
export const dormantStacks = (all: DormantSite[]): DormantStack[] =>
  all.map((s) => ({ siteId: s.siteId, siteName: s.siteName, watch: s.watch - s.risk, risk: s.risk - s.critical, critical: s.critical }));
