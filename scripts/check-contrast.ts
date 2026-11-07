// Contrast check for the theme tokens in src/app/globals.css (WCAG 2.x ratios).
// Usage: npm run check:contrast
import { readFileSync } from "node:fs";

type Rgb = [number, number, number];
const css = readFileSync("src/app/globals.css", "utf8");

function block(selector: string) {
  const start = css.indexOf(`${selector} {`);
  const end = css.indexOf("\n}", start);
  return css.slice(start, end);
}

function tokens(selector: string) {
  const out: Record<string, { rgb: Rgb; alpha: number }> = {};
  for (const m of block(selector).matchAll(/--([\w-]+):\s*oklch\(([^)]+)\)/g)) {
    const [lch, a] = m[2].split("/").map((s) => s.trim());
    const [L, C, H] = lch.split(/\s+/).map(Number);
    out[m[1]] = { rgb: oklchToSrgb(L, C, H), alpha: a ? parseFloat(a) / 100 : 1 };
  }
  return out;
}

function oklchToSrgb(L: number, C: number, H: number): Rgb {
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return lin.map((v) => Math.min(1, Math.max(0, v))) as Rgb; // linear sRGB, clamped
}

const luminance = ([r, g, b]: Rgb) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const ratio = (a: Rgb, b: Rgb) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const fromGamma = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
// browsers blend alpha colours in gamma-encoded sRGB
const over = (fg: { rgb: Rgb; alpha: number }, bg: Rgb): Rgb =>
  fg.rgb.map((c, i) => fromGamma(toGamma(c) * fg.alpha + toGamma(bg[i]) * (1 - fg.alpha))) as Rgb;

// [foreground token, background token, minimum ratio]
const pairs: [string, string, number][] = [
  ["foreground", "background", 4.5],
  ["muted-foreground", "background", 4.5],
  ["muted-foreground", "card", 4.5],
  ["card-foreground", "card", 4.5],
  ["primary", "background", 4.5], // accent used as text and thread line
  ["primary-foreground", "primary", 4.5],
  ["certain-foreground", "certain", 4.5],
  ["uncertain-foreground", "uncertain", 4.5],
  ["sidebar-foreground", "sidebar", 4.5],
  ["sidebar-accent-foreground", "sidebar-accent", 4.5],
  ["muted-foreground", "sidebar", 4.5], // group labels and the Theme label
  ["sidebar-border", "sidebar", 1.1],
  ["border", "background", 1.2], // hairline is visible but quiet
  ["certain", "background", 1.05], // chip fill vs page (edge comes from the chip border)
  ["uncertain", "background", 1.1],
];

// Chip edges as used in provenance-chip.tsx: foreground at 25% / 30% over the chip fill
const edges: [string, string, number, number][] = [
  ["certain-foreground", "certain", 0.25, 1.5],
  ["uncertain-foreground", "uncertain", 0.3, 1.5],
];

let failed = 0;
for (const [name, sel] of [["light", ":root"], ["dark", ".dark"]] as const) {
  const t = tokens(sel);
  const bgOf = (k: string) => t[k];
  console.log(`\n${name}`);
  for (const [fgName, bgName, min] of pairs) {
    const bg = bgOf(bgName);
    const base = t.background.rgb;
    const bgRgb = over(bg, base);
    const fgRgb = over(t[fgName], bgRgb);
    const r = ratio(fgRgb, bgRgb);
    const ok = r >= min;
    if (!ok) failed++;
    console.log(`${ok ? "pass" : "FAIL"}  ${fgName} on ${bgName}: ${r.toFixed(2)} (min ${min})`);
  }
  for (const [fgName, fillName, a, min] of edges) {
    const fill = over(t[fillName], t.background.rgb);
    const edge = over({ rgb: t[fgName].rgb, alpha: a }, fill);
    const r = ratio(edge, t.background.rgb);
    const ok = r >= min;
    if (!ok) failed++;
    console.log(`${ok ? "pass" : "FAIL"}  chip edge ${fillName} vs page background: ${r.toFixed(2)} (min ${min})`);
  }
}
process.exit(failed ? 1 : 0);

