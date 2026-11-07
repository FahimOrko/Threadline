import { Suspense } from "react";
import { Panel } from "@/components/panel";
import { ScenarioStrip } from "@/components/scenario-strip";
import { StatCardSkeleton } from "@/components/states";
import { resolveCustomer } from "@/lib/customer";
import { generatedSource } from "@/lib/data/generated";
import { PERIOD, section, sectionFacts, sectionIntro, type SectionSlug } from "@/lib/dashboard";
import { explainer } from "@/lib/explain";
import { baselineShortName, footprintFacts, observations as observationsFor, percentageFacts, type Sensitivity } from "@/lib/engine";
import { SENSITIVITY_LABEL, resolveBaseline, resolveSensitivity } from "@/lib/selection";
import type { AppData } from "@/lib/data/schemas";

type Search = Promise<Record<string, string | string[] | undefined>>;

export type SectionContext = {
  data: AppData;
  customer: AppData["customers"][number];
  baseline: AppData["baselines"][number];
  short: string;
  sensitivity: Sensitivity;
  scope: { customerId: string; period: typeof PERIOD };
  /** The "i" text for a registry key (ADR 0028), tokens resolved from the engine's Facts and the selected comparison; "" for a key without one. */
  explain: (key: string) => string;
};

/**
 * One section page: heading and skeleton prerender, the rest waits for searchParams (runtime data).
 * Notices for an unknown customer, baseline or sensitivity come first, as on the old page.
 */
export function SectionPage({ slug, scenario, searchParams, children }: { slug: SectionSlug; /** Show the scenario strip: only on pages where the baseline or estimate change a figure (ADR 0027). */ scenario?: boolean; searchParams: Search; children: (ctx: SectionContext) => React.ReactNode | Promise<React.ReactNode> }) {
  const { label } = section(slug);
  return (
    <div className="space-y-6">
      {scenario && <Scenario />}
      <h1 className="text-2xl font-semibold">{label}</h1>
      <Suspense
        fallback={
          <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(13rem,1fr))]">
            {[0, 1, 2, 3].map((i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <Content slug={slug} searchParams={searchParams}>
          {children}
        </Content>
      </Suspense>
    </div>
  );
}

async function Scenario() {
  const { baselines } = await generatedSource.load();
  return <ScenarioStrip baselines={baselines.map((b) => ({ baseline_id: b.baseline_id, name: baselineShortName(b) }))} />;
}

async function Content({ slug, searchParams, children }: { slug: SectionSlug; searchParams: Search; children: (ctx: SectionContext) => React.ReactNode | Promise<React.ReactNode> }) {
  const [data, params] = await Promise.all([generatedSource.load(), searchParams]);
  const { customer, rejected } = resolveCustomer(params.customer, data.customers);
  const { baseline, rejected: badBaseline } = resolveBaseline(params.baseline, data.baselines);
  const { sensitivity, rejected: badSensitivity } = resolveSensitivity(params.sensitivity);
  const short = baselineShortName(baseline);
  const scope = { customerId: customer.customer_id, period: PERIOD };
  // Intros and explanations may name a Fact of any page, so tokens resolve against all of them.
  const tokenFacts = [...sectionFacts(data, scope).tokens, ...footprintFacts(data, scope, baseline, sensitivity), ...percentageFacts(data, scope), ...observationsFor(data, scope).facts];
  const ctx: SectionContext = {
    data,
    customer,
    baseline,
    short,
    sensitivity,
    scope,
    explain: explainer(tokenFacts, { comparison: short, Comparison: `${short[0].toUpperCase()}${short.slice(1)}` }),
  };
  const notes = [
    rejected !== null && `"${rejected}" is not a known customer, so ${customer.customer_name} is shown instead.`,
    badBaseline !== null && `"${badBaseline}" is not a known comparison, so ${short} is shown instead.`,
    badSensitivity !== null && `"${badSensitivity}" is not a known estimate level, so the Standard estimate is shown instead.`,
  ].filter((n): n is string => n !== false);
  return (
    <div className="space-y-6">
      {notes.map((n) => (
        <Panel key={n} role="status">
          <p className="text-sm">{n}</p>
        </Panel>
      ))}
      <div className="space-y-0.5">
        <h2 className="text-base font-medium">{section(slug).subheading}</h2>
        <p className="max-w-[65ch] text-sm text-muted-foreground">{sectionIntro(slug, tokenFacts, { customer: customer.customer_name, period: PERIOD.from.slice(0, 4), comparison: short, sensitivity: SENSITIVITY_LABEL[sensitivity] })}</p>
      </div>
      {await children(ctx)}
    </div>
  );
}
