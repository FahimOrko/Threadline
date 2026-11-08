import { Badge } from "@/components/badge";
import { ChartFrame, seriesMath, seriesTable } from "@/components/chart-frame";
import { Co2eComparisonChart } from "@/components/co2e-comparison-chart";
import { PartBar, Ring } from "@/components/charts-simple";
import { ThreadLine } from "@/components/charts-recharts";
import { Collapsible } from "@/components/collapsible";
import { FigurePanel, InlineStat, pick, type PanelFigure } from "@/components/figure-panel";
import { Notice } from "@/components/notice";
import { ObservationCard } from "@/components/observation-card";
import { Panel } from "@/components/panel";
import { PriorityPicker } from "@/components/priority-picker";
import { ProvenanceChip } from "@/components/provenance-chip";
import { ExportCard } from "@/components/export-card";
import { ShowMathPopover } from "@/components/show-math";
import { factShowMath } from "@/components/fact-stat-card";
import { StoryHeader } from "@/components/story-header";
import { StoryChapter } from "@/components/story-chapter";
import { buttonVariants } from "@/components/ui/button";
import { resolveCustomer } from "@/lib/customer";
import { isUncertain } from "@/lib/dashboard-data";
import { generatedQuality, generatedSource } from "@/lib/data/generated";
import { baselineShortName, dataReadinessFacts, footprintComparison, monthlySeries, type Fact } from "@/lib/engine";
import { explainer, renderTemplate, type Sentence } from "@/lib/explain";
import { formatPeriod } from "@/lib/format";
import { SENSITIVITY_LABEL, resolveBaseline, resolvePriorities, resolveSensitivity, resolveView, siteHref } from "@/lib/selection";
import { FIGURE_LABEL, buildStory, factText } from "@/lib/story";
import { BASELINE_CAVEAT, DATA_GAPS, DATA_PACK_NOTE, DATA_SOURCES, ROUNDING_NOTE, assumptionRows, sensitivityNote } from "@/lib/story/closing";
import Link from "next/link";
import { buildExport, exportFileName, readinessLines, toJson, toMarkdown } from "@/lib/story/export";
import { storyFacts } from "@/lib/story/facts";
import { GAME_PATH, gameHref } from "@/lib/story/game";

// Full year 2025, fixed like the dashboard. Every engine call takes it as an argument.
export const PERIOD = { from: "2025-01", to: "2025-12" };

const th = "px-3 py-1.5 font-medium";

/** The Story report, ending in the export card. Reads runtime data, so callers wrap it in Suspense. */
export async function StoryDocument({ searchParams }: { searchParams: PageProps<"/story">["searchParams"] }) {
  const [data, params] = await Promise.all([generatedSource.load(), searchParams]);
  const { customer, rejected } = resolveCustomer(params.customer, data.customers);
  const { baseline, rejected: badBaseline } = resolveBaseline(params.baseline, data.baselines);
  const { sensitivity, rejected: badSensitivity } = resolveSensitivity(params.sensitivity);
  const { priorities, rejected: badPriorities } = resolvePriorities(params.priorities);
  const short = baselineShortName(baseline);
  const linkParams = { customer: customer.customer_id, baseline: baseline.baseline_id, sensitivity, view: resolveView(params.view) }; // in-app links keep the view (ADR 0023)
  const scope = { customerId: customer.customer_id, period: PERIOD };
  const { facts, observations, observationFacts } = storyFacts(data, scope, baseline, sensitivity);
  const fact = (id: string): Fact => {
    const f = facts.find((x) => x.id === id);
    if (!f) throw new Error(`Unknown story card: ${id}`);
    return f;
  };
  const comparisonWords = { baseline: short, comparison: short, Comparison: `${short[0].toUpperCase()}${short.slice(1)}`, sensitivity: SENSITIVITY_LABEL[sensitivity] };
  const explain = explainer(facts, comparisonWords);
  const fig = pick(facts, explain);
  const sentence = (s: Sentence) => renderTemplate([s], facts, comparisonWords);
  const siteName = (id: string) => data.sites.find((s) => s.site_id === id)?.site_name ?? id;
  const readiness = dataReadinessFacts(generatedQuality, PERIOD);
  const sourceRows = readiness.filter((f) => f.id.startsWith("invalid_rows_"));
  const withRows = sourceRows.filter((f) => f.value !== 0);
  const findings = readiness.filter((f) => f.id.startsWith("crosscheck_"));
  const assumptions = assumptionRows();
  const unset = assumptions.filter((a) => !a.set);
  const year = PERIOD.from.slice(0, 4);
  const cmp = footprintComparison(data, scope, baseline, sensitivity);

  const exportModel = buildExport({ data, quality: generatedQuality, customerId: customer.customer_id, baseline, sensitivity, priorities, period: PERIOD });
  const cover = `Value review for ${formatPeriod(PERIOD)}, compared against ${short}, using the ${SENSITIVITY_LABEL[sensitivity]}.`;
  const sourceName = (f: Fact) => f.label.replace("Invalid or unmapped rows: ", "");

  // The chart a chapter reuses from the dashboard. Each is the dashboard's own markup over the same engine output.
  const series = (m: "avoided_purchase_cost" | "service_requests") => monthlySeries(data, scope, m, { baseline, sensitivity });
  const charts = {
    "co2e-comparison": () => cmp && <Co2eComparisonChart cmp={cmp} short={short} year={year} co2eSaved={fact("co2e_saved")} explain={explain} />,
    "avoided-trend": () => {
      const s = series("avoided_purchase_cost");
      return (
        <ChartFrame title="When were purchases avoided?" explain={explain("chart:avoided-trend")} caption="Estimated avoided purchase cost per month, dashed because it is an estimate." summary="Monthly avoided purchase cost over the year; the same numbers are in the table." table={seriesTable("Avoided purchase cost by month", [s])} math={seriesMath(s.fact)}>
          <ThreadLine points={s.points} unit={s.unit} dashed={isUncertain(s.fact)} />
        </ChartFrame>
      );
    },
    "requests-trend": () => {
      const s = series("service_requests");
      return (
        <ChartFrame title="Did the customer ask for more help over the year?" explain={explain("chart:requests-trend")} caption="Service requests per month." summary="Monthly service requests over the year; the same numbers are in the table." table={seriesTable("Service requests by month", [s])} math={seriesMath(s.fact)}>
          <ThreadLine points={s.points} unit={s.unit} dashed={isUncertain(s.fact)} />
        </ChartFrame>
      );
    },
    "waste-treatment": () => null, // drawn inside the panel, as on the dashboard
  } as const;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        {rejected !== null && (
          <Notice>
            &quot;{rejected}&quot; is not a known customer, so {customer.customer_name} is shown instead.
          </Notice>
        )}
        {badBaseline !== null && (
          <Notice>
            &quot;{badBaseline}&quot; is not a known comparison, so {short} is shown instead.
          </Notice>
        )}
        {badSensitivity !== null && (
          <Notice>
            &quot;{badSensitivity}&quot; is not a known estimate level, so the Standard estimate is shown instead.
          </Notice>
        )}
        {badPriorities.length > 0 && (
          <Notice>
            Not used as priorities: {badPriorities.map((v) => `"${v}"`).join(", ")}. Only the first two valid, distinct priorities count.
          </Notice>
        )}
      </div>

      <StoryHeader
        title={customer.customer_name}
        summary={cover}
        actions={
          <>
            <Link href={gameHref(GAME_PATH, params, {})} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Play the review
            </Link>
            <a href="#export" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Export
            </a>
          </>
        }
      >
        <PriorityPicker picks={priorities} params={linkParams} />
      </StoryHeader>

      {buildStory(priorities).map((c) => {
        const [heroId, ...rest] = c.cards;
        const figure = (id: string): PanelFigure[] => fig(id, { label: FIGURE_LABEL[id] });
        const hero = figure(heroId)[0];
        const ringed = (f: Fact) => (f.value == null ? undefined : <Ring percent={f.value} label={FIGURE_LABEL[f.id]} />);
        const waste = c.chart === "waste-treatment" ? cmp?.composition.waste : undefined;
        return (
          <StoryChapter key={c.id} id={c.id} title={c.title} picked={c.picked} lines={c.lines.map(sentence).filter(Boolean)}>
            <FigurePanel
              wide
              title={c.panel}
              hero={hero}
              aside={c.id === "circularity" || c.id === "service" ? ringed(hero.fact) : undefined}
              visual={waste && <PartBar label="Textile waste by treatment" parts={waste} />}
              stats={rest.flatMap(figure)}
            />
            {c.chart && charts[c.chart]()}
            {c.observations === "risk" && (
              <div className="grid gap-3 lg:grid-cols-2">
                {observations
                  .filter((o) => o.type === "risk")
                  .map((o) => (
                    <ObservationCard
                      key={o.id}
                      observation={o}
                      facts={o.factIds.map((id) => observationFacts.find((f) => f.id === id)!)}
                      sites={o.scope.siteIds.map((id) => ({ siteId: id, siteName: siteName(id), href: siteHref(id, linkParams) }))}
                    />
                  ))}
              </div>
            )}
          </StoryChapter>
        );
      })}

      <StoryChapter id="methodology" title="How we calculated this" lines={[BASELINE_CAVEAT, sensitivityNote(sensitivity), ROUNDING_NOTE]}>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Data sources</h3>
          <ul className="max-w-[65ch] list-disc space-y-1 pl-5 text-sm">
            {DATA_SOURCES.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <Collapsible title="Team assumptions">
          <p className="max-w-[65ch] text-sm text-muted-foreground">Values only the team or Lindström can supply. Every one is assumed. A value that is not set yet reads &quot;Needs input&quot; and is never replaced by a number.</p>
          <table className="w-full text-sm">
            <caption className="sr-only">Team assumptions, set and not set</caption>
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th scope="col" className={th}>Id</th>
                <th scope="col" className={th}>What it is</th>
                <th scope="col" className={th}>Value</th>
                <th scope="col" className={th}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {assumptions.map((a) => (
                <tr key={a.id} className="align-top">
                  <td className="num px-3 py-1.5">{a.id}</td>
                  <td className="px-3 py-1.5">
                    {a.label}
                    <span className="block max-w-[55ch] text-xs text-muted-foreground">{a.meaning}</span>
                  </td>
                  <td className="px-3 py-1.5">{a.set ? <span className="num">{a.value}</span> : a.value}</td>
                  <td className="px-3 py-1.5">
                    <Badge variant={a.set ? "default" : "accent"}>{a.set ? "Set, assumed" : "Needs input"}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Collapsible>
        <Collapsible title="Assumptions in the data pack">
          <p className="max-w-[65ch] text-sm text-muted-foreground">{DATA_PACK_NOTE}</p>
          <table className="w-full text-sm">
            <caption className="sr-only">Assumptions that come with the data pack</caption>
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th scope="col" className={th}>Assumption</th>
                <th scope="col" className={th}>Value or rule</th>
                <th scope="col" className={th}>Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.assumptions.map((a) => (
                <tr key={a.assumption_id} className="align-top">
                  <td className="px-3 py-1.5">{a.assumption}</td>
                  <td className="px-3 py-1.5">{a.value_or_rule}</td>
                  <td className="px-3 py-1.5">{a.confidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Collapsible>
      </StoryChapter>

      <StoryChapter
        id="data-readiness"
        title="Data readiness"
        lines={readinessLines(sourceRows)}
      >
        {findings.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Findings</h3>
            <Panel>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-x-4 gap-y-3">
                {findings.map((f) => (
                  <InlineStat key={f.id} fact={f} label={f.label} explain={explain("finding:crosscheck")} />
                ))}
              </div>
              <p className="mt-3 max-w-[65ch] text-xs text-muted-foreground">Out-of-order scans are sorted by time before any figure uses them.</p>
            </Panel>
          </div>
        )}
        {(withRows.length > 0 || unset.length > 0) && (
          <Collapsible title="Rows left out and values still needed">
            {withRows.length > 0 && (
              <ul className="divide-y text-sm">
                {withRows.map((f) => (
                  <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 py-1.5">
                    <span>{sourceName(f)}</span>
                    <span className="flex items-center gap-2">
                      <span className="num">{factText(f)}</span>
                      <ProvenanceChip methods={f.methods} source={f.source} />
                      <ShowMathPopover {...factShowMath(f)} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {unset.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Values the team still needs</h4>
                <ul className="max-w-[65ch] list-disc space-y-1 pl-5 text-sm">
                  {unset.map((a) => (
                    <li key={a.id}>{a.label}</li>
                  ))}
                </ul>
              </div>
            )}
          </Collapsible>
        )}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Known data gaps</h3>
          <ul className="max-w-[65ch] list-disc space-y-1 pl-5 text-sm">
            {DATA_GAPS.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>
      </StoryChapter>
      <ExportCard md={toMarkdown(exportModel)} json={toJson(exportModel)} fileBase={exportFileName(customer.customer_name, PERIOD)} />
    </div>
  );
}
