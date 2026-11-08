// Impact World zones as plain data (ADR 0031): the hub maps over ZONES and the page picks each built zone's stage and card by id. No numbers here.
import { gameHref, type Params } from "@/lib/story/game";

export const WORLD_PATH = "/world";

export type ZoneId = "trees" | "water" | "air" | "energy" | "circularity" | "delivery";
export type Zone = {
  id: ZoneId;
  name: string;
  /** Phosphor icon name, mapped in the component. */
  icon: "Tree" | "Drop" | "Wind" | "Lightning" | "Recycle" | "Truck";
  status: "built" | "soon";
  /** The engine Fact the hub shows; none while the zone has no framing (Air). */
  headlineFactId?: string;
  /** Registry key of the zone's "i" explanation. */
  explainKey?: string;
};

/** Order is fixed and equal: never sorted or sized by data. Equal wedges come from 360 / ZONES.length. */
export const ZONES: readonly Zone[] = [
  { id: "trees", name: "Trees", icon: "Tree", status: "built", headlineFactId: "trees_saved", explainKey: "zone:trees" },
  { id: "water", name: "Water", icon: "Drop", status: "soon", headlineFactId: "water_saved" },
  { id: "air", name: "Air", icon: "Wind", status: "soon" },
  { id: "energy", name: "Energy", icon: "Lightning", status: "soon", headlineFactId: "energy_saved" },
  { id: "circularity", name: "Circularity", icon: "Recycle", status: "soon", headlineFactId: "recycling_reuse_share" },
  { id: "delivery", name: "Delivery", icon: "Truck", status: "soon", headlineFactId: "delivery_footprint" },
];

type Param = string | string[] | undefined;

/** Resolves `?zone=`. No value or an unknown one is the hub (`zone` null); `rejected` names an unknown value. A zone not built yet is the hub too. */
export function resolveZone(param: Param): { zone: Zone | null; rejected: string | null } {
  const value = Array.isArray(param) ? param[0] : param;
  if (value === undefined || value === "") return { zone: null, rejected: null };
  const match = ZONES.find((z) => z.id === value);
  if (!match) return { zone: null, rejected: value };
  return { zone: match.status === "built" ? match : null, rejected: null };
}

/** The hub (`zone` null) or a zone, keeping every other query param, including `view` and unknown ones. */
export const worldHref = (params: Params, zone: ZoneId | null) => gameHref(WORLD_PATH, params, { zone });
