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

/** Card headline: 100 or more prints whole, below 100 one decimal, below 1 up to three ("1 406 483", "146.96" -> "147", "7.68" -> "7.7"). "%" keeps its fixed one decimal. */
export function formatCardValue(n: number, unit?: string): string {
  if (unit === "%") return formatPercent(n);
  // Under one, a third decimal keeps a small factor honest (0.060 reads "0.06", never "0.1").
  const digits = Math.abs(n) >= 100 ? 0 : Math.abs(n) < 1 && n !== 0 ? 3 : 1;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(n).replaceAll(",", " ");
}

/** A value for display in Show math (inputs and range); the unit "%" and "per 100 garments" select the one-decimal rule. */
export const formatValue = (n: number, unit?: string) =>
  unit === "%" || unit === "per 100 garments" ? formatPercent(n) : formatNumber(n);

export const formatPeriod = (p: Period) => (p.from === p.to ? p.from : `${p.from} to ${p.to}`);

export const formatQuantity = (n: number, unit?: string) => (unit ? `${formatValue(n, unit)} ${unit}` : formatNumber(n));

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2025-10" -> "Oct", or "Oct 2025" with `year`. */
export const formatMonth = (m: string, year = false) => `${MONTHS[Number(m.slice(5, 7)) - 1]}${year ? ` ${m.slice(0, 4)}` : ""}`;
/** "Oct to Dec 2025", "Dec 2025" for one month, both years when they differ. */
export function formatMonthRange(p: Period): string {
  if (p.from === p.to) return formatMonth(p.from, true);
  return p.from.slice(0, 4) === p.to.slice(0, 4) ? `${formatMonth(p.from)} to ${formatMonth(p.to, true)}` : `${formatMonth(p.from, true)} to ${formatMonth(p.to, true)}`;
}

/** The short span a trend names next to its figure: "Dec", "Oct–Dec", or both years when they differ. */
export function formatMonthSpan(p: Period): string {
  if (p.from === p.to) return formatMonth(p.from);
  return p.from.slice(0, 4) === p.to.slice(0, 4) ? `${formatMonth(p.from)}–${formatMonth(p.to)}` : `${formatMonth(p.from, true)}–${formatMonth(p.to, true)}`;
}
