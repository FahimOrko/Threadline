import { AnimatedValue } from "@/components/animated-value";
import { ChangeHighlight } from "@/components/change-highlight";
import { factShowMath } from "@/components/fact-stat-card";
import { InfoPopover } from "@/components/info-popover";
import { Panel } from "@/components/panel";
import { ProvenanceChip } from "@/components/provenance-chip";
import { ShowMathPopover } from "@/components/show-math";
import type { Fact } from "@/lib/engine";
import { formatCardValue } from "@/lib/format";
import { needsInputHint } from "@/lib/explain";
import { cn } from "@/lib/utils";

/** One figure in a panel. `label` is the short on-screen name (the Fact's full label is in Show math); `animate` counts the value up once (Overview only). */
export type PanelFigure = { fact: Fact; label?: string; animate?: boolean; /** The change with its comparison, shown under the value it belongs to. */ trend?: React.ReactNode; /** The "i" text (ADR 0028), resolved by the page; none for an obvious figure. */ explain?: string; /** Under the figure's chip, for example the sites a count names. */ extra?: React.ReactNode };

function Value({ fact, animate, className }: { fact: Fact; animate?: boolean; className: string }) {
  if (fact.value === null) return <span className="text-base font-medium text-muted-foreground">Needs input</span>;
  const text = formatCardValue(fact.value, fact.unit);
  return <span className={cn("num", className)}>{animate ? <AnimatedValue value={fact.value} unit={fact.unit} text={text} /> : text}</span>;
}

export const Provenance = ({ fact }: { fact: Fact }) => (
  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
    <ProvenanceChip variant="label" methods={fact.methods} source={fact.source} />
    <ShowMathPopover {...factShowMath(fact)} />
  </div>
);

/** A smaller figure inside a panel: short label, value, unit, then its own chip and Show math. A missing value reads "Needs input", never 0. */
export function InlineStat({ fact, label, animate, trend, explain, extra }: PanelFigure) {
  return (
    <ChangeHighlight value={fact.value} className="min-w-0 space-y-1">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-muted-foreground">{label ?? fact.label}</p>
        {explain && <InfoPopover text={explain} className="-mt-0.5 -mr-1" />}
      </div>
      <p className="flex flex-wrap items-baseline gap-x-1">
        <Value fact={fact} animate={animate} className="text-lg font-medium" />
        {fact.value !== null && <span className="text-xs text-muted-foreground">{fact.unit}</span>}
      </p>
      {trend}
      {fact.value === null && <p className="text-xs text-muted-foreground">{needsInputHint(fact)}</p>}
      <Provenance fact={fact} />
      {extra}
    </ChangeHighlight>
  );
}

/**
 * A grouped panel (ADR 0027): a title by meaning, one hero figure, one small visual (`aside` beside the hero, `visual` under it) and related figures as
 * inline stats. Every figure keeps its chip and Show math. Short labels on screen; the detail is in Show math.
 */
export function FigurePanel({ title, hero, aside, visual, stats, footer, className, wide }: { title: string; hero: PanelFigure; aside?: React.ReactNode; visual?: React.ReactNode; stats?: PanelFigure[]; footer?: React.ReactNode; className?: string; /** A full-width panel: the related figures sit beside the hero (and its ring) instead of under it, so no empty middle opens up. */ wide?: boolean }) {
  const statsEl = stats && stats.length > 0 && (
    <div className={cn("grid grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))] gap-x-4 gap-y-3", wide ? "min-w-0 flex-1 @[40rem]/panel:border-l @[40rem]/panel:pl-8" : "mt-auto border-t pt-3")}>
      {stats.map((s) => (
        <InlineStat key={s.fact.id} {...s} />
      ))}
    </div>
  );
  return (
    <Panel data-slot="figure-panel" className={cn("@container/panel flex h-full flex-col gap-3", className)}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium">{title}</h3>
        {hero.explain && <InfoPopover text={hero.explain} className="-mt-0.5 -mr-1" />}
      </div>
      <div className={cn("flex items-center gap-4", wide && "flex-wrap @[40rem]/panel:flex-nowrap @[40rem]/panel:gap-8")}>
        <ChangeHighlight value={hero.fact.value} className="min-w-0 space-y-1">
          <p className="text-xs text-muted-foreground">{hero.label ?? hero.fact.label}</p>
          <p className="flex flex-wrap items-baseline gap-x-1.5">
            <Value fact={hero.fact} animate={hero.animate} className="text-2xl font-medium @[17rem]/panel:text-3xl" />
            {hero.fact.value !== null && <span className="text-sm text-muted-foreground">{hero.fact.unit}</span>}
          </p>
          {hero.trend}
          {hero.fact.value === null && <p className="text-xs text-muted-foreground">{needsInputHint(hero.fact)}</p>}
          <Provenance fact={hero.fact} />
          {hero.extra}
        </ChangeHighlight>
        {aside}
        {wide && statsEl}
      </div>
      {visual}
      {!wide && statsEl}
      {footer}
    </Panel>
  );
}

/** Picks a Fact by id into a panel figure; a Fact the engine did not produce gives no figure, so the panel simply lacks it. */
export const pick =
  (facts: readonly Fact[], explain?: (id: string) => string) =>
  (id: string, rest: Omit<PanelFigure, "fact"> = {}): PanelFigure[] => {
    const fact = facts.find((f) => f.id === id);
    return fact ? [{ fact, explain: explain?.(id) || undefined, ...rest }] : [];
  };
