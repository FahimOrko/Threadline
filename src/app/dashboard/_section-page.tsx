import { Suspense } from "react";
import { Panel } from "@/components/panel";
import { StatCardSkeleton } from "@/components/states";
import { resolveCustomer } from "@/lib/customer";
import { generatedSource } from "@/lib/data/generated";
import { PERIOD, section, sectionFacts, sectionIntro, type SectionSlug } from "@/lib/dashboard";
import { baselineShortName, footprintFacts, type Fact, type Sensitivity } from "@/lib/engine";
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
  /** The intro for this section, tokens resolved from `facts`. */
  intro: (facts: readonly Fact[]) => string;
};

/**
 * One section page: heading and skeleton prerender, the rest waits for searchParams (runtime data).
 * Notices for an unknown customer, baseline or sensitivity come first, as on the old page.
 */
export function SectionPage({ slug, searchParams, children }: { slug: SectionSlug; searchParams: Search; children: (ctx: SectionContext) => React.ReactNode | Promise<React.ReactNode> }) {
  const { label } = section(slug);
  return (
    <div className="space-y-6">
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

async function Content({ slug, searchParams, children }: { slug: SectionSlug; searchParams: Search; children: (ctx: SectionContext) => React.ReactNode | Promise<React.ReactNode> }) {
  const [data, params] = await Promise.all([generatedSource.load(), searchParams]);
  const { customer, rejected } = resolveCustomer(params.customer, data.customers);
  const { baseline, rejected: badBaseline } = resolveBaseline(params.baseline, data.baselines);
  const { sensitivity, rejected: badSensitivity } = resolveSensitivity(params.sensitivity);
  const short = baselineShortName(baseline);
  const ctx: SectionContext = {
    data,
    customer,
    baseline,
    short,
    sensitivity,
    scope: { customerId: customer.customer_id, period: PERIOD },
    intro: (facts) =>
      sectionIntro(slug, facts, { customer: customer.customer_name, period: PERIOD.from.slice(0, 4), baseline: short, sensitivity: SENSITIVITY_LABEL[sensitivity] }),
  };
  // Intro tokens may name a Fact of any page, so they resolve against all of them.
  const tokenFacts = [...sectionFacts(data, ctx.scope).tokens, ...footprintFacts(data, ctx.scope, baseline, sensitivity)];
  const notes = [
    rejected !== null && `"${rejected}" is not a known customer, so ${customer.customer_name} is shown instead.`,
    badBaseline !== null && `"${badBaseline}" is not a known baseline, so ${short} is shown instead.`,
    badSensitivity !== null && `"${badSensitivity}" is not a known sensitivity level, so base is shown instead.`,
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
        <p className="max-w-[65ch] text-sm text-muted-foreground">{ctx.intro(tokenFacts)}</p>
      </div>
      {await children(ctx)}
    </div>
  );
}
