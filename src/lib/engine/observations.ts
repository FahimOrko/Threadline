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
  /** Plain meeting language, no site names (the card links them), no ids, no digits; numbers and ids live in the Facts. */
  text: string;
  suggestedAction: string;
};
export type ObservationSet = { observations: Observation[]; facts: Fact[] };

type ObsData = Pick<AppData, "sites" | "customers" | "assumptions" | "repairs" | "serviceActivity" | "products" | "pickupGaps">;

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
      { id: "obs_replacements_postponed", type: "value", severity: "low", audience: "both", factIds: [], title: "Repairs are saving you from buying new garments", text: "Every garment we repaired is one you did not have to replace yet. This is an estimate: we count each repair as one replacement put off.", suggestedAction: "Mention it in the review as proof that repairing pays off." },
      postponed,
    );

  const dormant = dormantSignal(data, scope, team);
  if (dormant.sites.length > 0)
    add(
      {
        id: "obs_dormant_critical", type: "risk", severity: "high", audience: "both", factIds: [], siteIds: dormant.sites.map((s) => s.siteId),
        title: "Some garments are sitting unused for a long time",
        text: "At these sites garments went a very long time between pickups. That can mean they are stored but not worn, or are not reaching the people who need them. This is about hygiene and availability at the site, not about individual wearers.",
        suggestedAction: "Ask the site manager whether these garments are still needed or should be collected.",
      },
      dormant.fact,
    );

  const over = overAllocationSignal(data, scope, team);
  if (over.sites.length > 0)
    add(
      {
        id: "obs_over_allocation", type: "risk", severity: "medium", audience: "both", factIds: [], siteIds: over.sites.map((s) => s.siteId),
        title: "More garments than people are using",
        text: "At these sites, fewer garments were in use last month than were set aside for them.",
        suggestedAction: "Talk about moving garments to a site that needs them, or setting aside fewer.",
      },
      over.fact,
    );

  const spike = repairSpikeSignal(data, scope, team);
  if (spike.sites.length > 0)
    add(
      {
        id: "obs_repair_spike", type: "risk", severity: "medium", audience: "both", factIds: [], siteIds: spike.sites.map((s) => s.siteId),
        title: "Repairs jumped at some sites",
        text: "At these sites, repairs in at least one month were far above what is normal for them.",
        suggestedAction: "Ask what changed, for example a new task or tougher conditions, and whether a sturdier garment would help.",
      },
      spike.fact,
    );

  const cost = costOfUnusedAllocation(data, scope, team);
  if (cost.value === null)
    add(
      { id: "obs_rental_fee_missing", type: "gap", severity: "medium", audience: "kam", factIds: [], title: "We cannot yet put a price on unused garments", text: "To show what they cost, we need the weekly rental fee per garment, and we do not have it yet.", suggestedAction: "Ask Lindström for the rental fee before the review." },
      cost,
    );
  if (dormant.notClassified.length > 0)
    add(
      {
        id: "obs_sites_not_classified", type: "gap", severity: "low", audience: "kam", factIds: [], siteIds: dormant.notClassified.map((s) => s.siteId),
        title: "Some sites cannot be checked for unused garments",
        text: "For these sites we do not know what kind of workplace they are, so we cannot tell how long is too long between pickups.",
        suggestedAction: "Agree with Lindström how to treat these sites, or leave them out of the unused-garment discussion.",
      },
      dormant.fact,
    );
  return { observations: out, facts: [...new Map(facts.map((f) => [f.id, f])).values()] };
}
