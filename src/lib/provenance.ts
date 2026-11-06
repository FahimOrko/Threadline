// Presentation rules for provenance labels (ADR 0004). No numbers are computed here.
export const METHODS = [
  "MEASURED",
  "CALCULATED",
  "ALLOCATED",
  "ESTIMATED",
  "ILLUSTRATIVE",
  "MANUAL_EDIT",
] as const;
export const SOURCES = [
  "SYNTHETIC",
  "SYNTHETIC_TEAM",
  "PUBLIC_REFERENCE",
  "ASSUMPTION",
] as const;

export type Method = (typeof METHODS)[number];
export type Source = (typeof SOURCES)[number];
export type Tone = "certain" | "uncertain";

const UNCERTAIN_METHODS: ReadonlySet<Method> = new Set([
  "ESTIMATED",
  "ILLUSTRATIVE",
  "MANUAL_EDIT",
]);

/** A value takes the tone of its least certain method; an ASSUMPTION source is uncertain too. */
export function chipTone(methods: readonly Method[], source: Source): Tone {
  return source === "ASSUMPTION" || methods.some((m) => UNCERTAIN_METHODS.has(m))
    ? "uncertain"
    : "certain";
}

export const label = (v: string) =>
  v.charAt(0) + v.slice(1).toLowerCase().replaceAll("_", " ");
