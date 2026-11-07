// The only subtraction a Fact comparison needs (ADR 0005, 0021): unrounded, same unit, and never a number when either side is "Needs input".
import type { Fact } from "./fact";

export type FactDelta = { value: number; unit: string; direction: "up" | "down" | "none" };

/** After minus before for the same Fact in two states. null when either value is null (ADR 0016); throws when the ids or units differ. */
export function factDelta(before: Pick<Fact, "id" | "value" | "unit">, after: Pick<Fact, "id" | "value" | "unit">): FactDelta | null {
  if (before.id !== after.id) throw new Error(`Cannot compare Fact ${before.id} with ${after.id}`);
  if (before.unit !== after.unit) throw new Error(`Fact ${before.id} changed unit from ${before.unit} to ${after.unit}`);
  if (before.value === null || after.value === null) return null;
  const value = after.value - before.value;
  return { value, unit: after.unit, direction: value > 0 ? "up" : value < 0 ? "down" : "none" };
}
