"use client";

import { Suspense } from "react";
import { Info } from "@phosphor-icons/react";
import { useSelection, useSetParam, type ShellBaseline } from "@/components/param-selects";
import { Segmented } from "@/components/segmented";
import { SENSITIVITY_LEVELS } from "@/lib/engine";
import { SENSITIVITY_LABEL, SENSITIVITY_TOOLTIP, baselineTooltip } from "@/lib/selection";

function Strip({ baselines }: { baselines: ShellBaseline[] }) {
  const { baseline, sensitivity } = useSelection([], baselines);
  const setParam = useSetParam();
  return (
    <section aria-label="Scenario" className="@container rounded-lg border border-primary/40 bg-primary/5 px-3 py-2">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <Segmented label="Comparing against" value={baseline.baseline_id} onChange={(v) => setParam("baseline", v)} options={baselines.map((b) => ({ value: b.baseline_id, label: b.name, tip: baselineTooltip(b.baseline_id) }))} />
        <Segmented label="Estimate" value={sensitivity} onChange={(v) => setParam("sensitivity", v)} options={SENSITIVITY_LEVELS.map((l) => ({ value: l, label: SENSITIVITY_LABEL[l], tip: SENSITIVITY_TOOLTIP[l] }))} />
      </div>
      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Info aria-hidden className="size-3.5 shrink-0" />
        These choices change the savings figures on this page.
      </p>
    </section>
  );
}

/** The scenario strip at the top of the pages whose figures depend on them, Overview and Environmental footprint (ADR 0017, 0027): the two choices that change the savings figures, as visible buttons, not dropdowns. */
export function ScenarioStrip({ baselines }: { baselines: ShellBaseline[] }) {
  return (
    <Suspense fallback={<div aria-hidden className="h-[4.75rem] rounded-lg border border-primary/40 bg-primary/5" />}>
      <Strip baselines={baselines} />
    </Suspense>
  );
}
