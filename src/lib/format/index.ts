// Display strings only. No arithmetic on data here: the engine computes, this prints (ADR 0005).
import type { Period } from "@/lib/engine";

/** "15 233", "1 140.5". Fixed en-US rules so server and browser print the same. */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n).replaceAll(",", " ");
}

/** Percentages print with one decimal ("83.5", "80.0"); rounding happens here, never in the engine. */
export function formatPercent(n: number): string {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n).replaceAll(",", " ");
}

/** A value for display; the unit "%" selects the percentage rule. */
export const formatValue = (n: number, unit?: string) => (unit === "%" ? formatPercent(n) : formatNumber(n));

export const formatPeriod = (p: Period) => (p.from === p.to ? p.from : `${p.from} to ${p.to}`);

export const formatQuantity = (n: number, unit?: string) => (unit ? `${formatValue(n, unit)} ${unit}` : formatNumber(n));
