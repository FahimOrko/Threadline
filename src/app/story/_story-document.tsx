import { factShowMath, FactStatCard } from "@/components/fact-stat-card";
import { Badge } from "@/components/badge";
import { Notice } from "@/components/notice";
import { ObservationCard } from "@/components/observation-card";
import { Panel } from "@/components/panel";
import { PriorityPicker } from "@/components/priority-picker";
import { ShowMathInlineProvider } from "@/components/show-math";
import { ProvenanceChip } from "@/components/provenance-chip";
import { ShowMathPopover } from "@/components/show-math";
import { PRIORITY_LABEL, StoryChapter } from "@/components/story-chapter";
import { buttonVariants } from "@/components/ui/button";
import { STORY_PRINT_PATH } from "@/lib/story/print";
import { resolveCustomer } from "@/lib/customer";
import { generatedQuality, generatedSource } from "@/lib/data/generated";
import { baselineShortName, dataReadinessFacts, type Fact } from "@/lib/engine";
import { formatPeriod } from "@/lib/format";
import { SENSITIVITY_LABEL, resolveBaseline, resolvePriorities, resolveSensitivity, siteHref } from "@/lib/selection";
import { buildStory, factText, resolveLine } from "@/lib/story";
import { BASELINE_CAVEAT, DATA_GAPS, DATA_SOURCES, OPEN_QUESTIONS, ROUNDING_NOTE, assumptionRows, sensitivityNote } from "@/lib/story/closing";
import Link from "next/link";
import { connection } from "next/server";
import { storyFacts } from "@/lib/story/facts";
import { GAME_PATH, gameHref } from "@/lib/story/game";

// Full year 2025, fixed like the dashboard. Every engine call takes it as an argument.
export const PERIOD = { from: "2025-01", to: "2025-12" };

// A document stamp, not a metric. Read per request (this runs after searchParams), fixed locale and zone so the stamp does not vary by server.
const generatedOn = () => new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "Europe/Helsinki" }).format(new Date());

const cardGrid = "grid gap-3 sm:grid-cols-2 lg:grid-cols-3";

export type StoryMode = "screen" | "print";

/** The one story rendering. `screen` is the Story page; `print` adds the cover block, hides the picker and expands Show math inline. Reads runtime data, so callers wrap it in Suspense. */
export async function StoryDocument({ searchParams, mode }: { searchParams: PageProps<"/story">["searchParams"]; mode: StoryMode }) {
  const [data, params] = await Promise.all([generatedSource.load(), searchParams]);
  await connection(); // the generation date below is read per request; Next rejects `new Date()` before a dynamic access
  const { customer, rejected } = resolveCustomer(params.customer, data.customers);
  const { baseline, rejected: badBaseline } = resolveBaseline(params.baseline, data.baselines);
  const { sensitivity, rejected: badSensitivity } = resolveSensitivity(params.sensitivity);
  const { priorities, rejected: badPriorities } = resolvePriorities(params.priorities);
  const short = baselineShortName(baseline);
  const linkParams = { customer: customer.customer_id, baseline: baseline.baseline_id, sensitivity };
  const { facts, observations, observationFacts } = storyFacts(data, { customerId: customer.customer_id, period: PERIOD }, baseline, sensitivity);
  const fact = (id: string): Fact => {
    const f = facts.find((x) => x.id === id);
    if (!f) throw new Error(`Story card ${id} has no matching Fact`);
    return f;
  };
  const words = { baseline: short, sensitivity: SENSITIVITY_LABEL[sensitivity] };
  const siteName = (id: string) => data.sites.find((s) => s.site_id === id)?.site_name ?? id;
  const readiness = dataReadinessFacts(generatedQuality, PERIOD);
  const sourceRows = readiness.filter((f) => f.id.startsWith("invalid_rows_"));
  const findings = readiness.filter((f) => f.id.startsWith("crosscheck_"));
  const assumptions = assumptionRows();

  const print = mode === "print";
  const exportQuery = new URLSearchParams({ ...linkParams, ...(priorities.length ? { priorities: priorities.join(",") } : {}) });

  return (
    <ShowMathInlineProvider inline={print}>
    <div className="space-y-10">
      <div className="space-y-3">
        {rejected !== null && (
          <Notice>
            &quot;{rejected}&quot; is not a known customer, so {customer.customer_name} is shown instead.
          </Notice>
        )}
        {badBaseline !== null && (
          <Notice>
            &quot;{badBaseline}&quot; is not a known baseline, so {short} is shown instead.
          </Notice>
        )}
        {badSensitivity !== null && (
          <Notice>
            &quot;{badSensitivity}&quot; is not a known sensitivity level, so base is shown instead.
          </Notice>
        )}
        {badPriorities.length > 0 && (
          <Notice screenOnly>
            Not used as priorities: {badPriorities.map((v) => `"${v}"`).join(", ")}. Only the first two valid, distinct priorities count.
          </Notice>
        )}
      </div>

      <StoryChapter id="cover" title={customer.customer_name} lines={[`Value review for ${formatPeriod(PERIOD)}, compared against ${short}, using the ${SENSITIVITY_LABEL[sensitivity]}.`]}>
        {print ? (
          <dl className="grid max-w-md grid-cols-[1fr_2fr] gap-x-3 gap-y-1 text-sm" data-slot="print-cover">
            <dt className="text-muted-foreground">Priorities</dt>
            <dd>{priorities.length ? priorities.map((p) => PRIORITY_LABEL[p]).join(", ") : "None chosen"}</dd>
            <dt className="text-muted-foreground">Baseline</dt>
            <dd>{short}</dd>
            <dt className="text-muted-foreground">Estimate</dt>
            <dd>{SENSITIVITY_LABEL[sensitivity]}</dd>
            <dt className="text-muted-foreground">Period</dt>
            <dd>{formatPeriod(PERIOD)}</dd>
            <dt className="text-muted-foreground">Generated</dt>
            <dd>{generatedOn()}</dd>
          </dl>
        ) : (
          <>
            <div className="print:hidden">
              <Link href={gameHref(GAME_PATH, params, {})} className={buttonVariants({ variant: "outline", size: "sm" })}>
                Play the review
              </Link>
            </div>
            <div className="print:hidden">
              <PriorityPicker picks={priorities} params={linkParams} />
            </div>
            <a href={`${STORY_PRINT_PATH}?${exportQuery.toString()}`} target="_blank" rel="noopener" className={`${buttonVariants({ variant: "outline", size: "sm" })} print:hidden`} data-print="hide">
              Export PDF
            </a>
          </>
        )}
      </StoryChapter>

      {buildStory(priorities).map((c) => (
        <StoryChapter key={c.id} id={c.id} title={c.title} picked={c.picked} lines={c.lines.map((l) => resolveLine(l, facts, words))}>
          <div className={cardGrid}>
            {c.cards.map((id) => (
              <FactStatCard key={id} fact={fact(id)} />
            ))}
          </div>
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
      ))}

      <StoryChapter id="methodology" title="How we calculated this" lines={[BASELINE_CAVEAT, sensitivityNote(sensitivity), ROUNDING_NOTE]}>
        <div className={cardGrid}>
          <FactStatCard fact={fact("co2e_saved")} />
          <FactStatCard fact={fact("co2e_saved_pct")} />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Data sources</h3>
          <ul className="max-w-[65ch] list-disc space-y-1 pl-5 text-sm">
            {DATA_SOURCES.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Team assumptions</h3>
          <p className="max-w-[65ch] text-sm text-muted-foreground">Values only the team or Lindström can supply. Every one is assumed. An unset one reads &quot;Needs input&quot; and is never replaced by a number.</p>
          <Panel className="p-0">
            <table className="w-full text-sm">
              <caption className="sr-only">Team assumptions, set and unset</caption>
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th scope="col" className="px-3 py-1.5 font-medium">Id</th>
                  <th scope="col" className="px-3 py-1.5 font-medium">Assumption</th>
                  <th scope="col" className="px-3 py-1.5 font-medium">Value</th>
                  <th scope="col" className="px-3 py-1.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {assumptions.map((a) => (
                  <tr key={a.id} className="align-top">
                    <td className="num px-3 py-1.5">{a.id}</td>
                    <td className="px-3 py-1.5">
                      {a.name}
                      <span className="block max-w-[55ch] text-xs text-muted-foreground">{a.note}</span>
                    </td>
                    <td className="px-3 py-1.5">{a.set ? <span className="num">{a.value}</span> : a.value}</td>
                    <td className="px-3 py-1.5">
                      <Badge variant={a.set ? "default" : "accent"}>{a.set ? "Set, assumed" : "Needs input"}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Assumptions in the data pack</h3>
          <ul className="max-w-[65ch] space-y-1 text-sm">
            {data.assumptions.map((a) => (
              <li key={a.assumption_id}>
                <span className="num">{a.assumption_id}</span> {a.assumption}: {a.value_or_rule} <span className="text-muted-foreground">(confidence: {a.confidence})</span>
              </li>
            ))}
          </ul>
        </div>
      </StoryChapter>

      <StoryChapter
        id="data-readiness"
        title="Data readiness"
        lines={["Counts come from the build's data-quality report. A row that is invalid or unmapped is counted and left out of every figure, never dropped silently."]}
      >
        {findings.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Findings</h3>
            <div className={cardGrid}>
              {findings.map((f) => (
                <FactStatCard key={f.id} fact={f} />
              ))}
            </div>
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Invalid or unmapped rows by source</h3>
          <Panel className="p-0">
            <ul className="divide-y text-sm">
              {sourceRows.map((f) => (
                <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5">
                  <span>{f.label.replace("Invalid or unmapped rows: ", "")}</span>
                  <span className="flex items-center gap-2">
                    <span className="num">{f.value === 0 ? "None found" : factText(f)}</span>
                    <ProvenanceChip methods={f.methods} source={f.source} />
                    <ShowMathPopover {...factShowMath(f)} />
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Still needs input</h3>
          <ul className="max-w-[65ch] list-disc space-y-1 pl-5 text-sm">
            {assumptions
              .filter((a) => !a.set)
              .map((a) => (
                <li key={a.id}>
                  <span className="num">{a.id}</span> {a.name}: {a.value}
                </li>
              ))}
          </ul>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Known data gaps</h3>
          <ul className="max-w-[65ch] list-disc space-y-1 pl-5 text-sm">
            {DATA_GAPS.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Open questions for Lindström</h3>
          <ol className="max-w-[65ch] list-decimal space-y-1 pl-5 text-sm">
            {OPEN_QUESTIONS.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
        </div>
      </StoryChapter>
    </div>
    </ShowMathInlineProvider>
  );
}
