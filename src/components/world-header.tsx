import Link from "next/link";
import { Suspense } from "react";
import { ScenarioControls } from "@/components/scenario-strip";
import type { ShellBaseline } from "@/components/param-selects";

/** The Impact World header strip (ADR 0031): the Story header's surface with the customer, the period and the same comparison and estimate controls the dashboard strip uses. `changeHref` adds "Change company" in the customer view. */
export function WorldHeader({ customerName, period, baselines, changeHref }: { customerName: string; period: string; baselines: ShellBaseline[]; changeHref?: string }) {
  return (
    <header data-slot="world-header" className="space-y-3 rounded-lg border border-primary/40 bg-primary/5 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <div className="min-w-0">
          <h1 className="text-lg font-medium">Impact World: {customerName}</h1>
          <p className="text-sm text-muted-foreground">{period}</p>
        </div>
        {changeHref && (
          <Link href={changeHref} className="text-sm text-primary hover:underline">
            Change company
          </Link>
        )}
      </div>
      <Suspense fallback={<div aria-hidden className="h-9" />}>
        <ScenarioControls baselines={baselines} />
      </Suspense>
    </header>
  );
}
