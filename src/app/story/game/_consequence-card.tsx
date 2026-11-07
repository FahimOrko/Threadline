import { factShowMath } from "@/components/fact-stat-card";
import { DeltaBadge } from "@/components/delta-badge";
import { Panel } from "@/components/panel";
import { ProvenanceChip } from "@/components/provenance-chip";
import { ShowMathPopover } from "@/components/show-math";
import type { Fact } from "@/lib/engine";
import { formatCardValue } from "@/lib/format";
import { NEEDS_INPUT } from "@/lib/story";
import type { FactChange } from "@/lib/story/game";

const valueText = (f: Fact) => (f.value === null ? NEEDS_INPUT : `${formatCardValue(f.value, f.unit)} ${f.unit}`);

function Value({ title, fact }: { title: string; fact: Fact }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className={fact.value === null ? "text-sm text-muted-foreground" : "num text-lg font-medium"}>{valueText(fact)}</p>
      <ShowMathPopover {...factShowMath(fact)} />
    </div>
  );
}

/** What a choice moved, beside the dialogue box. `changes` are before/after pairs with a delta badge (none when either side needs input); `standing` lists Facts as they stand, for a choice that moves none (the priority). Every value keeps its chip and Show math. */
export function ConsequenceCard({ heading, against, changes, standing, emptyText }: { heading: string; against?: string; changes?: FactChange[]; standing?: Fact[]; emptyText: string }) {
  const empty = (changes?.length ?? standing?.length ?? 0) === 0;
  return (
    <Panel data-slot="consequence-card" className="max-h-[26rem] space-y-3 overflow-y-auto">
      <div>
        <h2 className="text-sm font-medium">{heading}</h2>
        {against && <p className="text-xs text-muted-foreground">{against}</p>}
      </div>
      {empty && <p className="text-sm text-muted-foreground">{emptyText}</p>}
      <ul className="divide-y">
        {changes?.map((c) => (
          <li key={c.id} className="space-y-2 py-3 first:pt-0 last:pb-0">
            <p className="text-sm">{c.after.label}</p>
            {c.after.value === null ? (
              <>
                <p className="text-sm text-muted-foreground">{NEEDS_INPUT}</p>
                <p className="text-xs text-muted-foreground">Set {c.after.assumptionIds.filter((id) => id.startsWith("T")).join(", ") || "the missing assumption"} in the assumptions config. No change can be shown.</p>
                <ShowMathPopover {...factShowMath(c.after)} />
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Value title="Before" fact={c.before} />
                <Value title="After" fact={c.after} />
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {c.delta && <DeltaBadge delta={c.delta} />}
              <ProvenanceChip methods={c.after.methods} source={c.after.source} />
            </div>
          </li>
        ))}
        {standing?.map((f) => (
          <li key={f.id} className="space-y-1.5 py-3 first:pt-0 last:pb-0">
            <p className="text-sm">{f.label}</p>
            <p className={f.value === null ? "text-sm text-muted-foreground" : "num text-lg font-medium"}>{valueText(f)}</p>
            <ProvenanceChip methods={f.methods} source={f.source} />
            <ShowMathPopover {...factShowMath(f)} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
