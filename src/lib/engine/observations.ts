// Rule-based observations (Slice 5). Pure; no ranking and no curation (Slice 7). The shape follows the product spec.
import type { AppData } from "@/lib/data/schemas";
import { TEAM_ASSUMPTIONS, type TeamAssumptions } from "./assumptions-config";
import type { Fact } from "./fact";
import type { OperationalScope } from "./operational";
import { replacementsPostponed } from "./replacements-postponed";
import { dormantSignal, overAllocationSignal, repairSpikeSignal } from "./signals";
import { costOfUnusedAllocation } from "./value";

export type ObservationType = "risk" | "value" | "gap" | "opportunity";
export type Observation = {
  id: string;
  type: ObservationType;
  severity: "high" | "medium" | "low";
  /** `siteIds` lists the flagged sites; empty = the whole customer. */
  scope: { customerId: string; siteIds: string[] };
  factIds: string[];
  /** `opportunity` items are KAM-only (product spec); the rental-fee gap is a KAM item too. */
  audience: "kam" | "both";
  title: string;
  /** Plain words and site names; numbers live in the Facts. */
  text: string;
  suggestedAction: string;
};
export type ObservationSet = { observations: Observation[]; facts: Fact[] };

type ObsData = Pick<AppData, "sites" | "customers" | "assumptions" | "repairs" | "serviceActivity" | "products" | "pickupGaps">;
const names = (xs: { siteName: string }[]) => xs.map((s) => s.siteName).join(", ");

export function observations(data: ObsData, scope: Omit<OperationalScope, "siteId">, team: TeamAssumptions = TEAM_ASSUMPTIONS): ObservationSet {
  const customerId = scope.customerId;
  const out: Observation[] = [];
  const facts: Fact[] = [];
  const add = (o: Omit<Observation, "scope"> & { siteIds?: string[] }, ...fs: Fact[]) => {
    const { siteIds = [], ...rest } = o;
    out.push({ ...rest, scope: { customerId, siteIds }, factIds: fs.map((f) => f.id) });
    facts.push(...fs);
  };

  const postponed = replacementsPostponed(data, scope);
  if ((postponed.value ?? 0) > 0)
    add(
      { id: "obs_replacements_postponed", type: "value", severity: "low", audience: "both", factIds: [], title: "Repairs are keeping garments in use", text: "Completed repairs postponed garment replacements, an estimate under assumption A002.", suggestedAction: "Use it as a value point in the review: repair is working." },
      postponed,
    );

  const dormant = dormantSignal(data, scope, team);
  if (dormant.sites.length > 0)
    add(
      {
        id: "obs_dormant_critical", type: "risk", severity: "high", audience: "both", factIds: [], siteIds: dormant.sites.map((s) => s.siteId),
        title: "Garments left unused for a long time",
        text: `Garments at ${names(dormant.sites)} went through a pickup gap in the Critical dormant tier. This is a site-level hygiene and availability discussion point; it says nothing about individual wearers.`,
        suggestedAction: "Raise it with the site manager and agree whether the garments are in use or need to be collected.",
      },
      dormant.fact,
    );

  const over = overAllocationSignal(data, scope, team);
  if (over.sites.length > 0)
    add(
      {
        id: "obs_over_allocation", type: "risk", severity: "medium", audience: "both", factIds: [], siteIds: over.sites.map((s) => s.siteId),
        title: "Garments allocated but not used",
        text: `Utilization at ${names(over.sites)} is below the cut-off in the last month, so more garments are allocated than are scanned.`,
        suggestedAction: "Discuss rebalancing between sites or reducing the allocation.",
      },
      over.fact,
    );

  const spike = repairSpikeSignal(data, scope, team);
  if (spike.sites.length > 0)
    add(
      {
        id: "obs_repair_spike", type: "risk", severity: "medium", audience: "both", factIds: [], siteIds: spike.sites.map((s) => s.siteId),
        title: "Repairs rose above the site's own trend",
        text: `Monthly repairs at ${names(spike.sites)} rose well above the site's trailing average in at least one month.`,
        suggestedAction: "Ask what changed at the site, and whether a heavier-duty product or design feedback is worth discussing.",
      },
      spike.fact,
    );

  const cost = costOfUnusedAllocation(data, scope, team);
  if (cost.value === null)
    add(
      { id: "obs_rental_fee_missing", type: "gap", severity: "medium", audience: "kam", factIds: [], title: "Cost of unused allocation cannot be shown", text: "The rental fee per piece is not set, so the cost of unused garments is not computed.", suggestedAction: `Ask Lindström for the rental fee (${team.rentalFeePerPieceWeek.id}) before the review.` },
      cost,
    );
  if (dormant.notClassified.length > 0)
    add(
      {
        id: "obs_sites_not_classified", type: "gap", severity: "low", audience: "kam", factIds: [], siteIds: dormant.notClassified.map((s) => s.siteId),
        title: "Some sites have no dormant tier",
        text: `${names(dormant.notClassified)} have a site type with no dormant tier row, so their dormant garments are not classified.`,
        suggestedAction: "Agree a tier row for the site type, or leave these sites out of the dormant discussion.",
      },
      dormant.fact,
    );
  return { observations: out, facts: [...new Map(facts.map((f) => [f.id, f])).values()] };
}
