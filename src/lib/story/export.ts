// The story's data export (ADR 0030): one model built from engine Facts and the closing data, two serialisers. No number is computed here.
// The Markdown uses display rounding; the JSON keeps the raw value next to the rounded text.
import { PRIORITY_LABEL } from "@/components/story-chapter";
import type { QualityReport } from "@/lib/data/pipeline";
import type { AppData, Baseline } from "@/lib/data/schemas";
import { baselineShortName, DORMANT_SITE_TYPE_TIERS, dataReadinessFacts, footprintComparison, monthlySeries, TEAM_ASSUMPTIONS, type Fact, type Period, type Sensitivity } from "@/lib/engine";
import { formatCardValue, formatMonth, formatPeriod, formatQuantity } from "@/lib/format";
import { label as provLabel } from "@/lib/provenance";
import { SENSITIVITY_LABEL, type Priority } from "@/lib/selection";
import { DATA_GAPS, DATA_SOURCES, OPEN_QUESTIONS, assumptionRows } from "./closing";
import { storyFacts } from "./facts";
import { FIGURE_LABEL, NEEDS_INPUT, buildStory, factText } from "./index";

/** Template wording of the .md file. Plain words, no digits and no banned word (tests scan these); quoted data is not part of it. */
export const EXPORT_TEXT = {
  note: "This data is synthetic, from the Lindström hackathon data pack. This export is not audit-ready sustainability reporting.",
  title: "Value review data",
  customer: "Customer",
  period: "Period",
  comparison: "Comparison",
  estimate: "Estimate level",
  priorities: "Priorities",
  none: "None chosen",
  figures: "Figures",
  charts: "Chart data",
  assumptions: "Team assumptions",
  assumptionsNote: "Values only the team or Lindström can supply. A value that is not set reads Needs input and is never replaced by a number.",
  readiness: "Data readiness",
  findings: "Findings",
  rowsLeftOut: "Rows left out",
  sources: "Data sources",
  gaps: "Known data gaps",
  questions: "Open questions for Lindström",
  value: "Value",
  status: "Status",
  source: "Source",
  showMath: "Show math",
  formula: "Formula",
  assumptionsUsed: "Assumptions used",
  none_: "none",
  range: "Range",
  low: "low",
  standard: "standard",
  high: "high",
  notModelled: "not modelled",
  notApplicable: "not applicable",
  confidence: "Confidence",
  readinessIntro: "Counts come from the build's data-quality report. A row that is invalid or unmapped is counted and left out of every figure, never dropped silently.",
  noRowsLeftOut: "No invalid or unmapped rows were found in any source.",
} as const;

type ShowMath = {
  formula: string;
  inputs: { label: string; value: number | string; unit?: string }[];
  notes: { label: string; text: string }[];
  assumptionIds: string[];
  comparison: string | null;
  range: { low: number | null; base: number | null; high: number | null };
};

export type ExportFigure = {
  id: string;
  label: string;
  /** Full precision, null while a team value is unset. */
  value: number | null;
  /** The rounded text the report shows, or "Needs input". */
  display: string;
  unit: string;
  status: string;
  methods: string[];
  source: string;
  confidence: string;
  scope: { customer: string; period: string };
  showMath: ShowMath;
};

export type ExportAssumption = { id: string; label: string; meaning: string; value: number | Record<string, string> | null; unit: string; display: string };

export type ExportChart = { id: string; title: string; unit: string; rows: { label: string; value: number | null; display: string }[] };

export type StoryExport = {
  note: string;
  customer: { id: string; name: string };
  period: Period;
  comparison: { id: string; name: string };
  estimate: string;
  priorities: { id: Priority; label: string }[];
  figures: ExportFigure[];
  charts: ExportChart[];
  assumptions: ExportAssumption[];
  readiness: { summary: string[]; rowsLeftOut: { source: string; id: string; value: number | null; display: string }[]; findings: ExportFigure[]; sources: string[]; gaps: string[] };
  openQuestions: string[];
};

const sourceName = (f: Pick<Fact, "label">) => f.label.replace("Invalid or unmapped rows: ", "");

/** The two sentences of the Data readiness chapter: how rows are counted, and which sources left rows out. Shared by the page and the export. */
export function readinessLines(rowFacts: Fact[]): [string, string] {
  const withRows = rowFacts.filter((f) => f.value !== 0);
  return [EXPORT_TEXT.readinessIntro, withRows.length === 0 ? EXPORT_TEXT.noRowsLeftOut : `Rows left out: ${withRows.map((f) => `${sourceName(f)} (${factText(f)})`).join(", ")}.`];
}

const figureOf = (f: Fact, comparison: string): ExportFigure => ({
  id: f.id,
  label: FIGURE_LABEL[f.id] ?? f.label,
  value: f.value,
  display: factText(f),
  unit: f.unit,
  status: f.value === null ? NEEDS_INPUT : f.methods.map(provLabel).join(", "),
  methods: f.methods,
  source: provLabel(f.source),
  confidence: f.confidence,
  scope: { customer: f.scope.customerName, period: formatPeriod(f.period) },
  showMath: {
    formula: f.formula,
    inputs: f.inputs.filter((i) => !i.note).map((i) => ({ label: i.label, value: i.value, ...(i.unit ? { unit: i.unit } : {}) })),
    notes: f.inputs.filter((i) => i.note).map((i) => ({ label: i.label, text: String(i.value) })),
    assumptionIds: f.assumptionIds,
    comparison: f.baseline ? comparison : null,
    range: f.range,
  },
});

export type ExportInput = {
  data: AppData;
  quality: QualityReport;
  customerId: string;
  baseline: Baseline;
  sensitivity: Sensitivity;
  priorities: Priority[];
  period: Period;
};

/** Everything the report shows, from the same engine calls the report makes, in report order. */
export function buildExport({ data, quality, customerId, baseline, sensitivity, priorities, period }: ExportInput): StoryExport {
  const scope = { customerId, period };
  const short = baselineShortName(baseline);
  const { facts, observationFacts } = storyFacts(data, scope, baseline, sensitivity);
  const customer = data.customers.find((c) => c.customer_id === customerId)!;
  const avoided = monthlySeries(data, scope, "avoided_purchase_cost", { baseline, sensitivity });
  const requests = monthlySeries(data, scope, "service_requests", { baseline, sensitivity });
  const cmp = footprintComparison(data, scope, baseline, sensitivity);

  // Report order: each chapter's cards, the observation figures, then the chart series. A card with no Fact throws, like the report does.
  const cards = buildStory(priorities).flatMap((c) =>
    c.cards.map((id) => {
      const f = facts.find((x) => x.id === id);
      if (!f) throw new Error(`Unknown story card: ${id}`);
      return f;
    }),
  );
  const shown = [...cards, ...observationFacts, ...[avoided.fact, requests.fact].filter((f): f is Fact => f !== null)];
  const figures = [...new Map(shown.map((f) => [f.id, f])).values()].map((f) => figureOf(f, short));

  const series = (id: string, title: string, s: typeof avoided): ExportChart => ({
    id,
    title,
    unit: s.unit,
    rows: s.points.map((p) => ({ label: formatMonth(p.month, true), value: p.value, display: p.value === null ? NEEDS_INPUT : formatCardValue(p.value, s.unit) })),
  });
  const bar = (label: string, value: number, unit: string) => ({ label, value, display: formatCardValue(value, unit) });
  const charts: ExportChart[] = [
    ...(cmp ? [{ id: "co2e-comparison", title: "CO2e by bar", unit: "kgCO2e", rows: [bar(short, cmp.metrics.co2e.comparison, "kgCO2e"), ...cmp.composition.emissions.map((p) => bar(p.label, p.value, p.unit)), bar("Net saving", cmp.netSaving, "kgCO2e")] }] : []),
    ...(cmp?.composition.waste ? [{ id: "waste-treatment", title: "Textile waste by treatment", unit: "kg", rows: cmp.composition.waste.map((p) => bar(p.label, p.value, p.unit)) }] : []),
    series("avoided-trend", "Avoided purchase cost by month", avoided),
    series("requests-trend", "Service requests by month", requests),
  ];

  const team = Object.values(TEAM_ASSUMPTIONS);
  const assumptions: ExportAssumption[] = assumptionRows().map((r) => {
    const t = team.find((a) => a.id === r.id);
    return { id: r.id, label: r.label, meaning: r.meaning, value: t ? t.value : { ...DORMANT_SITE_TYPE_TIERS.map }, unit: t?.unit ?? "", display: r.value };
  });

  const readiness = dataReadinessFacts(quality, period);
  const rowFacts = readiness.filter((f) => f.id.startsWith("invalid_rows_"));

  return {
    note: EXPORT_TEXT.note,
    customer: { id: customer.customer_id, name: customer.customer_name },
    period,
    comparison: { id: baseline.baseline_id, name: short },
    estimate: SENSITIVITY_LABEL[sensitivity],
    priorities: priorities.map((id) => ({ id, label: PRIORITY_LABEL[id] })),
    figures,
    charts,
    assumptions,
    readiness: {
      summary: readinessLines(rowFacts),
      rowsLeftOut: rowFacts.filter((f) => f.value !== 0).map((f) => ({ source: sourceName(f), id: f.id, value: f.value, display: factText(f) })),
      findings: readiness.filter((f) => f.id.startsWith("crosscheck_")).map((f) => figureOf(f, short)),
      sources: DATA_SOURCES,
      gaps: DATA_GAPS,
    },
    openQuestions: OPEN_QUESTIONS,
  };
}

export const toJson = (m: StoryExport): string => JSON.stringify(m, null, 2);

const T = EXPORT_TEXT;

const figureLines = (f: ExportFigure): string[] => {
  const s = f.showMath;
  const range = (v: number | null) => (v === null ? T.notModelled : formatQuantity(v, f.unit));
  return [
    `### ${f.label}`,
    `- ${T.value}: ${f.display}`,
    `- ${T.status}: ${f.status}`,
    `- ${T.source}: ${f.source}`,
    `- ${T.showMath}`,
    `  - ${T.formula}: ${s.formula}`,
    `  - ${T.customer}: ${f.scope.customer}`,
    `  - ${T.period}: ${f.scope.period}`,
    ...s.inputs.map((i) => `  - ${i.label}: ${typeof i.value === "number" ? formatQuantity(i.value, i.unit) : i.value}`),
    ...s.notes.map((n) => `  - ${n.label}: ${n.text}`),
    `  - ${T.confidence}: ${f.confidence}`,
    `  - ${T.assumptionsUsed}: ${s.assumptionIds.length ? s.assumptionIds.join(", ") : T.none_}`,
    `  - ${T.comparison}: ${s.comparison ?? T.notApplicable}`,
    `  - ${T.range}: ${T.low} ${range(s.range.low)}, ${T.standard} ${range(s.range.base)}, ${T.high} ${range(s.range.high)}`,
    "",
  ];
};

export function toMarkdown(m: StoryExport): string {
  const list = (items: string[], ordered = false) => items.map((s, i) => `${ordered ? `${i + 1}.` : "-"} ${s}`);
  return [
    `# ${T.title}`,
    "",
    `> ${m.note}`,
    "",
    `- ${T.customer}: ${m.customer.name}`,
    `- ${T.period}: ${formatPeriod(m.period)}`,
    `- ${T.comparison}: ${m.comparison.name}`,
    `- ${T.estimate}: ${m.estimate}`,
    `- ${T.priorities}: ${m.priorities.length ? m.priorities.map((p) => p.label).join(", ") : T.none}`,
    "",
    `## ${T.figures}`,
    "",
    ...m.figures.flatMap(figureLines),
    `## ${T.charts}`,
    "",
    ...m.charts.flatMap((c) => [`### ${c.title}`, ...c.rows.map((r) => `- ${r.label}: ${r.display}`), ""]),
    `## ${T.assumptions}`,
    "",
    T.assumptionsNote,
    "",
    ...m.assumptions.map((a) => `- ${a.id} ${a.label}: ${a.display}. ${a.meaning}`),
    "",
    `## ${T.readiness}`,
    "",
    ...m.readiness.summary.flatMap((s) => [s, ""]),
    ...(m.readiness.rowsLeftOut.length ? [`### ${T.rowsLeftOut}`, ...m.readiness.rowsLeftOut.map((r) => `- ${r.source}: ${r.display}`), ""] : []),
    ...(m.readiness.findings.length ? [`### ${T.findings}`, "", ...m.readiness.findings.flatMap(figureLines)] : []),
    `### ${T.sources}`,
    ...list(m.readiness.sources),
    "",
    `### ${T.gaps}`,
    ...list(m.readiness.gaps),
    "",
    `## ${T.questions}`,
    "",
    ...list(m.openQuestions, true),
    "",
  ].join("\n");
}

/** `<customer>-<from>-to-<to>-value-review`, without an extension. */
export const exportFileName = (customerName: string, period: Period): string => {
  const slug = customerName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${slug}-${period.from}-to-${period.to}-value-review`;
};
