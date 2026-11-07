// Gallery block for the dashboard's chart and motion components. Sample data, not engine output (ADR 0010).
import { Suspense } from "react";
import { AnimatedValue } from "@/components/animated-value";
import { ChangeHighlight } from "@/components/change-highlight";
import { ChartFrame } from "@/components/chart-frame";
import { AreaChartInteractive, ThreadLine } from "@/components/charts-recharts";
import { BarList, BulletList, CompareBar, Donut, PairedBars, PartBar, Ring, Sparkline, StackedBars, ComparisonBars } from "@/components/charts-simple";
import { InfoPopover } from "@/components/info-popover";
import { FigurePanel } from "@/components/figure-panel";
import { FadeIn } from "@/components/fade-in";
import { Heatmap } from "@/components/heatmap";
import { Panel } from "@/components/panel";
import { ChipLegend, ProvenanceChip } from "@/components/provenance-chip";
import { ScenarioStrip } from "@/components/scenario-strip";
import { SiteLinks } from "@/components/site-links";
import { Spotlight } from "@/components/spotlight";
import { TrendBadge } from "@/components/trend-badge";
import type { SiteMatrix } from "@/lib/engine";
import { SAMPLE_LABEL, sampleFact, sampleNeedsInputFact, sampleSiteLinks } from "./_sample/data";

const months = Array.from({ length: 12 }, (_, i) => `2025-${String(i + 1).padStart(2, "0")}`);
const wave = months.map((month, i) => ({ month, value: 100 + Math.round(40 * Math.sin(i / 2)) + i * 3 }));
const windows = { 3: { from: "2025-10", to: "2025-12", value: 345 }, 6: { from: "2025-07", to: "2025-12", value: 690 }, 12: { from: "2025-01", to: "2025-12", value: 1380 } };
const measure = (id: string, label: string, unit: string, dashed: boolean) => ({ id, label, series: { points: wave, windows, unit, dashed } });
const matrix = (m: SiteMatrix["measure"], label: string, unit: string): SiteMatrix => ({
  measure: m,
  label,
  unit,
  months,
  rows: ["Sample plant", "Sample office", "Sample hub"].map((siteName, r) => {
    const cells = months.map((month, i) => ({ month, value: 40 + ((i * 7 + r * 13) % 50), highlight: (i + r * 2) % 5 === 0 }));
    return { siteId: `S${r}`, siteName, highlighted: cells.filter((c) => c.highlight).length, cells };
  }),
});
const trend = { from: { from: "2025-07", to: "2025-09" }, to: { from: "2025-10", to: "2025-12" }, change: 8.4, direction: "up" as const };

export function ChartGallery() {
  return (
    <div className="space-y-6">
      <p className="max-w-[65ch] text-sm text-muted-foreground">Dashboard charts and effects ({SAMPLE_LABEL}). Each chart sits in a ChartFrame: the question, a caption, a summary and a hidden table. Colours are chart tokens; nothing glows.</p>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">ScenarioStrip</h3>
        <p className="max-w-[65ch] text-sm text-muted-foreground">The baseline and estimate as visible segmented buttons with plain tooltips, above every dashboard page. Tinted and bordered so it reads as a control. Wired to this page&apos;s URL here.</p>
        <ScenarioStrip baselines={[{ baseline_id: "B_LOCAL", name: "local laundry" }, { baseline_id: "B_HOME", name: "home washing" }, { baseline_id: "B_INHOUSE", name: "in-house laundry" }]} />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">FigurePanel, Ring, PartBar, SiteLinks</h3>
        <p className="max-w-[65ch] text-sm text-muted-foreground">A grouped panel: one hero figure, one small visual and related figures as inline stats, each with its own chip and Show math. A missing value reads &quot;Needs input&quot;, never 0. SiteLinks names the sites a count covers.</p>
        <div className="grid gap-3 lg:grid-cols-3">
          <FigurePanel title="With a ring" hero={{ fact: sampleFact, label: "Short label" }} aside={<Ring percent={32.2} label="Sample share" />} stats={[{ fact: sampleFact, label: "Related figure" }]} />
          <FigurePanel title="With a part-of-whole bar" hero={{ fact: sampleFact, label: "Total" }} visual={<PartBar label="Sample parts" parts={[{ label: "Process", value: 50, unit: "kgCO2e" }, { label: "Delivery", value: 24, unit: "kgCO2e" }]} />} stats={[{ fact: sampleNeedsInputFact, label: "Not set yet" }]} />
          <FigurePanel title="With site links" hero={{ fact: sampleFact, label: "Sites flagged", extra: <SiteLinks label="Sample flagged sites" sites={[...sampleSiteLinks, { siteId: "X3", siteName: "Sample site C", href: "#" }, { siteId: "X4", siteName: "Sample site D", href: "#" }]} max={3} moreHref="#" /> }} />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Label chip and legend</h3>
        <p className="max-w-[65ch] text-sm text-muted-foreground">One line always: the least certain method&apos;s word, +N for more, the source mark. The full text is the name and the tooltip. One legend per page.</p>
        <div className="flex flex-wrap gap-2">
          <ProvenanceChip variant="label" methods={["MEASURED"]} source="SYNTHETIC" />
          <ProvenanceChip variant="label" methods={["ALLOCATED", "ESTIMATED"]} source="SYNTHETIC" />
          <ProvenanceChip variant="label" methods={["CALCULATED"]} source="ASSUMPTION" />
        </div>
        <ChipLegend methods={["MEASURED", "CALCULATED", "ALLOCATED", "ESTIMATED", "ILLUSTRATIVE"]} sources={["SYNTHETIC", "ASSUMPTION"]} />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">TrendBadge, Sparkline, CompareBar, BulletList</h3>
        <p className="max-w-[65ch] text-sm text-muted-foreground">A word, a glyph and a signed percent; neutral, never good or bad. Hover or focus for the exact period compared.</p>
        <div className="flex flex-wrap items-center gap-3">
          <TrendBadge trend={trend} />
          <TrendBadge trend={{ ...trend, change: 3.2, direction: "down" }} />
          <TrendBadge trend={{ from: { from: "2025-09", to: "2025-09" }, to: { from: "2025-12", to: "2025-12" }, change: 0, direction: "flat" }} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Panel className="space-y-2">
            <Sparkline values={wave.map((p) => p.value)} />
            <CompareBar a={{ label: "local laundry", value: 900 }} b={{ label: "Service", value: 300 }} unit="L" />
            <BulletList compact cutoff={80} cutoffLabel="Cut-off" rows={[{ key: "u", label: "Utilization", value: 83.5 }]} />
          </Panel>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Motion (five effects, off under reduced motion)</h3>
        <p className="max-w-[65ch] text-sm text-muted-foreground">AnimatedValue counts up once when it scrolls into view and always lands on the exact string. Spotlight follows the pointer over a tile. ChangeHighlight rings a card whose Fact value changed. FadeIn plays once per page load. The sidebar&apos;s hover and active indicator is in AppSidebar above.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Spotlight>
            <Panel className="h-full space-y-1">
              <p className="text-sm text-muted-foreground">AnimatedValue in a Spotlight</p>
              <p className="num text-2xl font-medium">
                <AnimatedValue value={1406483} text="1 406 483" />
              </p>
            </Panel>
          </Spotlight>
          <ChangeHighlight value={1}>
            <Panel className="h-full text-sm">ChangeHighlight (first render, no ring)</Panel>
          </ChangeHighlight>
          <FadeIn>
            <Panel className="h-full text-sm">FadeIn (once per page load)</Panel>
          </FadeIn>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">AreaChartInteractive and ThreadLine</h3>
        <div className="grid gap-3 lg:grid-cols-2">
          <ChartFrame fade={false} title="How is each measure moving over the year?" caption="Measure and range toggles; the total is for the months shown." summary="Sample monthly values." table={{ caption: "Sample values", head: ["Month", "Value"], rows: wave.map((p) => [p.month, p.value]) }}>
            <AreaChartInteractive measures={[measure("a", "Sample A", "L", true), measure("b", "Sample B", "%", false)]} />
          </ChartFrame>
          <ChartFrame fade={false} title="Is repair load rising or falling? (thread with spike line)" caption="Dashed line is the spike line; flagged months are labelled." summary="Sample monthly repairs." table={{ caption: "Sample repairs", head: ["Month", "Repairs"], rows: wave.map((p) => [p.month, p.value]) }}>
            <ThreadLine unit="repairs" points={wave.map((p, i) => ({ ...p, threshold: i < 3 ? null : 150 }))} marks={[{ month: "2025-10", label: "Spike Oct" }]} />
          </ChartFrame>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">BarList, hatched Needs input, dashed estimate, StackedBars</h3>
        <div className="grid gap-3 lg:grid-cols-3">
          <ChartFrame fade={false} title="Needs input is hatched, never zero" summary="Sample bars." table={{ caption: "Sample", head: ["Site", "EUR per week"], rows: [["Plant A", "Needs input"], ["Plant B", 120]] }}>
            <BarList unit="EUR per week" rows={[{ key: "a", label: "Sample plant A", value: null }, { key: "b", label: "Sample plant B", value: 120 }]} />
          </ChartFrame>
          <ChartFrame fade={false} title="Dashed means an estimate" summary="Sample dashed bars." table={{ caption: "Sample", head: ["Site", "EUR"], rows: [["Plant A", 5400], ["Plant B", 2100]] }}>
            <BarList dashed unit="EUR" rows={[{ key: "a", label: "Sample plant A", value: 5400 }, { key: "b", label: "Sample plant B", value: 2100 }]} />
          </ChartFrame>
          <ChartFrame fade={false} title="Dormant gaps by tier" summary="Sample stacked bars." table={{ caption: "Sample", head: ["Site", "Watch", "Risk", "Critical"], rows: [["Plant A", 4, 2, 1]] }}>
            <StackedBars partLabels={["Watch", "Risk", "Critical"]} rows={[{ key: "a", label: "Sample plant A", parts: [{ label: "Watch", value: 4 }, { label: "Risk", value: 2 }, { label: "Critical", value: 1 }] }]} />
          </ChartFrame>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">BulletList, PairedBars, ComparisonBars, Donut</h3>
        <div className="grid gap-3 lg:grid-cols-2">
          <ChartFrame fade={false} title="Utilization against the cut-off" caption="Tick is the cut-off; shaded part is below it." summary="Sample utilization." table={{ caption: "Sample", head: ["Site", "%"], rows: [["Plant A", 55.5], ["Plant B", 91.2]] }}>
            <BulletList cutoff={80} rows={[{ key: "a", label: "Sample plant A", value: 55.5 }, { key: "b", label: "Sample plant B", value: 91.2 }]} />
          </ChartFrame>
          <ChartFrame fade={false} title="Comparison against service" summary="Sample paired bars." table={{ caption: "Sample", head: ["Metric", "Comparison", "Service"], rows: [["Water", 900, 300]] }}>
            <PairedBars rows={[{ key: "w", title: "Water", a: { label: "local laundry", value: 900 }, b: { label: "Service", value: 300 }, unit: "L", badge: "66.7% saved" }]} />
          </ChartFrame>
          <ChartFrame fade={false} title="Why is the net saving what it is?" summary="Sample comparison." explain="Sample explanation: what the chart means and why it matters." table={{ caption: "Sample", head: ["Bar", "kgCO2e"], rows: [["Comparison", 100], ["Service", 70]] }}>
            <ComparisonBars unit="kgCO2e" comparison={{ label: "Sample comparison", value: 100 }} service={{ label: "Sample service", process: 50, delivery: 20, total: 70 }} netSaving={30} />
          </ChartFrame>
          <ChartFrame fade={false} title="Two slices of one whole" summary="Sample donut." table={{ caption: "Sample", head: ["Part", "kgCO2e"], rows: [["Process", 30], ["Delivery", 10]] }}>
            <Donut parts={[{ label: "Process", value: 30, unit: "kgCO2e" }, { label: "Delivery", value: 10, unit: "kgCO2e" }]} center={{ value: "25%", label: "delivery" }} />
          </ChartFrame>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Heatmap (neutral cells, highlighted problems), InfoPopover</h3>
        <p className="flex items-center gap-2 text-sm">
          InfoPopover: <InfoPopover text="Sample explanation. It says what the figure means and why it matters, in plain words." />
        </p>
        <Suspense fallback={null}>
          <Heatmap
            matrices={[matrix("garment_utilization", "Garment utilization", "%"), matrix("repairs", "Repairs", "repairs")]}
            frames={{
              garment_utilization: { title: "Where and when were garments under-used?", caption: "Sample caption naming the period.", summary: "Sample heatmap.", explain: "Sample explanation.", legend: "Highlighted: a month when fewer than the sample line of garments were in use." },
              repairs: { title: "Where and when did repairs spike?", caption: "Sample caption naming the period.", summary: "Sample heatmap.", explain: "Sample explanation.", legend: "Highlighted: a month when repairs jumped above the sample level." },
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
