import { ArrowDown, ArrowRight } from "@phosphor-icons/react/ssr";
import { InlineStat, type PanelFigure } from "@/components/figure-panel";
import { Panel } from "@/components/panel";

/** One step of the derivation: a title, one plain sentence (no digits), and the Facts it uses. Each figure keeps its chip and Show math through `InlineStat`. */
export type DerivationStep = { title: string; text: string; figures: PanelFigure[] };

/**
 * "How we got here" (Impact World zones): numbered steps from the washed weight to the headline figure, joined by arrows. Presentational only: it receives Facts,
 * computes nothing, and a missing Fact reads "Needs input" with its hint, never 0. No motion, so reduced motion needs no special case.
 */
export function HowWeGotHere({ steps, title = "How we got here" }: { steps: readonly DerivationStep[]; title?: string }) {
  return (
    <section data-slot="how-we-got-here" aria-labelledby="how-we-got-here" className="space-y-3">
      <h3 id="how-we-got-here" className="text-sm font-medium">
        {title}
      </h3>
      <ol className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-stretch">
        {steps.flatMap((step, i) => [
          <li key={step.title} className="min-w-0">
            <Panel className="h-full space-y-3">
              <div className="flex items-center gap-2">
                <span aria-hidden className="num flex size-5 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {i + 1}
                </span>
                <h4 className="text-sm font-medium">{step.title}</h4>
              </div>
              <p className="text-xs text-muted-foreground">{step.text}</p>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))] gap-x-4 gap-y-3">
                {step.figures.map((f) => (
                  <InlineStat key={f.fact.id + (f.label ?? "")} {...f} />
                ))}
              </div>
            </Panel>
          </li>,
          i < steps.length - 1 ? (
            <li key={`arrow-${i}`} aria-hidden className="flex items-center justify-center text-muted-foreground">
              <ArrowRight className="hidden lg:block" />
              <ArrowDown className="lg:hidden" />
            </li>
          ) : null,
        ])}
      </ol>
    </section>
  );
}
