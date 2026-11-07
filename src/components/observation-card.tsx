import Link from "next/link";
import { factShowMath } from "@/components/fact-stat-card";
import { Badge } from "@/components/badge";
import { Panel } from "@/components/panel";
import { ProvenanceChip } from "@/components/provenance-chip";
import { ShowMathPopover } from "@/components/show-math";
import type { Fact, Observation } from "@/lib/engine";
import { formatCardValue } from "@/lib/format";

const TYPE_LABEL: Record<Observation["type"], string> = { risk: "Risk", value: "Value highlight", gap: "Data gap", opportunity: "Opportunity" };

/** An engine Observation with the Facts it rests on. Type and severity are always words; links go to the flagged sites. */
export function ObservationCard({ observation, facts, sites }: { observation: Observation; facts: Fact[]; sites: { siteId: string; siteName: string; href: string }[] }) {
  return (
    <Panel className="space-y-3" data-slot="observation-card">
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant={observation.type === "value" ? "accent" : "default"}>{TYPE_LABEL[observation.type]}</Badge>
        <Badge>{observation.severity} severity</Badge>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium">{observation.title}</h3>
        <p className="max-w-[65ch] text-sm text-muted-foreground">{observation.text}</p>
      </div>
      <p className="text-sm">
        <span className="text-muted-foreground">Suggested action: </span>
        {observation.suggestedAction}
      </p>
      {sites.length > 0 && (
        <ul aria-label="Flagged sites" className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
          {sites.map((s) => (
            <li key={s.siteId}>
              <Link href={s.href} className="text-primary hover:underline">
                {s.siteName}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="space-y-2 border-t pt-2">
        {facts.map((f) => (
          <div key={f.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p className="text-sm">
              <span className="text-muted-foreground">{f.label}: </span>
              {f.value === null ? <span>Needs input</span> : <span className="num">{formatCardValue(f.value, f.unit)}</span>}
              {f.value !== null && <span className="text-xs text-muted-foreground"> {f.unit}</span>}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <ProvenanceChip methods={f.methods} source={f.source} />
              <ShowMathPopover {...factShowMath(f)} align="end" />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
