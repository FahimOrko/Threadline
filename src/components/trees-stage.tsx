"use client";

import { ArrowClockwise } from "@phosphor-icons/react";
import { useState } from "react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/ui/button";
import type { Fact, TreeStage } from "@/lib/engine";
import { formatCardValue } from "@/lib/format";

// Geometry of the picture only: positions are a fixed function of the icon index (no randomness, so server and browser markup match). No displayed number is computed here.
const W = 800;
const H = 420;
const GROUND_TOP = 200;
const GROUND_BOTTOM = 400;
const FALL_MS = 1500; // the last tree starts falling this long after the first; each fall takes 700ms, so all have landed by about 2.2s
const SWEEP_MS = 400; // Lindström's trees turn teal over this span, left to right, starting at 3.0s

type Kind = "service" | "saved" | "extra";
type Tree = { key: number; x: number; y: number; scale: number; kind: Kind; fall: number; tint: number };

/** Rows from the back (small, pale) to the front, filled row by row; the grove is about 12 rows deep when it is large. */
export function layoutTrees(stage: TreeStage, saving: boolean): Tree[] {
  const total = Math.max(stage.comparisonIcons, stage.serviceIcons);
  if (total === 0) return [];
  const rows = Math.min(12, Math.max(1, Math.round(Math.sqrt(total / 3))));
  const cols = Math.ceil(total / rows);
  const shown = Math.min(stage.comparisonIcons, stage.serviceIcons);
  const trees: Tree[] = [];
  for (let i = 0; i < total; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const depth = rows === 1 ? 1 : row / (rows - 1);
    const scale = 0.6 + 0.4 * depth;
    const x = ((col + 0.5 + (row % 2) * 0.5) / (cols + 0.5)) * (W - 60) + 30;
    const y = GROUND_TOP + 24 + depth * (GROUND_BOTTOM - GROUND_TOP - 24);
    const rank = col * rows + row; // left to right, then back to front
    const kind: Kind = rank < shown ? "service" : saving ? "saved" : "extra";
    // The icon's own size is capped so a small count does not draw giants.
    const fit = Math.min(1.6, ((W - 60) / cols / 26) * 0.95);
    trees.push({ key: i, x, y, scale: scale * fit, kind, fall: (i / total) * FALL_MS, tint: 3000 + (kind === "service" ? (rank / Math.max(1, shown)) * SWEEP_MS : 0) });
  }
  return trees;
}

/** One tree, original artwork: round crown and trunk, drawn in `currentColor` so a class tints it. */
function TreeSymbol() {
  return (
    <symbol id="tree-icon" viewBox="0 0 24 32">
      <rect x="10.8" y="19" width="2.4" height="11" rx="1.2" />
      <circle cx="12" cy="10" r="8" />
      <circle cx="7" cy="15" r="6" />
      <circle cx="17" cy="15" r="6" />
    </symbol>
  );
}

function Scenery() {
  return (
    <>
      <defs>
        <linearGradient id="world-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--card)" }} />
          <stop offset="1" style={{ stopColor: "var(--background)" }} />
        </linearGradient>
        <radialGradient id="world-glow" cx="0.85" cy="0.1" r="0.6">
          <stop offset="0" style={{ stopColor: "var(--primary)", stopOpacity: 0.22 }} />
          <stop offset="1" style={{ stopColor: "var(--primary)", stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#world-sky)" />
      <rect width={W} height={H} fill="url(#world-glow)" />
      <g className="world-cloud fill-muted" opacity="0.7">
        <ellipse cx="150" cy="70" rx="46" ry="12" />
        <ellipse cx="180" cy="62" rx="30" ry="12" />
      </g>
      <g className="world-cloud world-cloud-slow fill-muted" opacity="0.55">
        <ellipse cx="520" cy="46" rx="56" ry="12" />
        <ellipse cx="550" cy="38" rx="32" ry="11" />
      </g>
      <path d="M0 210 Q 140 120 300 190 T 620 170 T 800 200 V 420 H 0 Z" className="fill-muted" opacity="0.4" />
      <path d="M0 250 Q 180 180 380 235 T 800 225 V 420 H 0 Z" className="fill-muted" opacity="0.7" />
      <rect y={GROUND_BOTTOM} width={W} height={H - GROUND_BOTTOM} className="fill-muted" />
    </>
  );
}

const kindClass: Record<Kind, string> = { service: "tree-service", saved: "tree-saved", extra: "tree-extra" };
const count = (f: Fact) => (f.value === null ? "Needs input" : formatCardValue(f.value, f.unit));

/**
 * The Trees stage (ADR 0031): one grove of icons falling and settling. Icon counts are the engine's integers; every number printed comes from a Fact.
 * The base style is the end state (teal needed, faded not needed), so the animation only exists under `prefers-reduced-motion: no-preference` and the final counts are in the text from the first render.
 */
export function TreesStage({ stage, comparison, service, saved, scale, comparisonName }: { stage: TreeStage | null; comparison: Fact; service: Fact; saved: Fact; scale: Fact; comparisonName: string }) {
  const [run, setRun] = useState(0);
  const saving = stage !== null && stage.extraIcons === 0;
  const trees = stage ? layoutTrees(stage, saving) : [];
  const summary =
    stage === null
      ? "Illustration: the tree figures need input, so no trees are drawn."
      : `Illustration of the tree figures. ${comparisonName} needs ${count(comparison)}. The Lindström service needs ${count(service)}. ${saving ? `The avoided emissions equal what ${count(saved)} young trees absorb in ten years.` : "With this comparison there are no avoided emissions to show as trees."} One tree icon stands for ${count(scale)} trees.`;
  return (
    <figure data-slot="trees-stage" className="space-y-2">
      <div className="relative overflow-hidden rounded-lg border bg-card">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} className="block aspect-[800/420] w-full">
          <Scenery />
          <defs>
            <TreeSymbol />
          </defs>
          <g key={run} data-slot="trees-grove">
            {trees.map((t) => (
              <g key={t.key} transform={`translate(${t.x.toFixed(1)} ${t.y.toFixed(1)}) scale(${t.scale.toFixed(2)})`}>
                <g className={`tree ${kindClass[t.kind]}`} style={{ "--fall": `${Math.round(t.fall)}ms`, "--tint": `${Math.round(t.tint)}ms` } as React.CSSProperties}>
                  <use href="#tree-icon" fill="currentColor" x="-12" y="-32" width="24" height="32" />
                </g>
              </g>
            ))}
          </g>
        </svg>
        <Badge variant="accent" className="absolute top-2 right-2">Illustration</Badge>
        {stage !== null && (
          <p aria-hidden className="trees-beats absolute top-2 left-2 text-xs font-medium text-foreground">
            <span className="beat beat-1">{comparisonName} needs these trees</span>
            <span className="beat beat-2">Lindström needs these</span>
            <span className="beat beat-3">{saving ? "The rest equal the avoided emissions" : "Lindström needs more"}</span>
          </p>
        )}
        {stage === null && <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">Needs input</p>}
        {stage !== null && (
          <Button type="button" variant="outline" size="sm" className="absolute right-2 bottom-2 motion-reduce:hidden" onClick={() => setRun((r) => r + 1)}>
            <ArrowClockwise aria-hidden /> Replay
          </Button>
        )}
      </div>
      <figcaption className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span aria-hidden className="size-2.5 rounded-full bg-chart-subject" /> Needed with Lindström</span>
        <span className="flex items-center gap-1.5"><span aria-hidden className={saving ? "size-2.5 rounded-full bg-chart-comparison opacity-30" : "size-2.5 rounded-full bg-chart-subject opacity-55"} /> {saving ? "Avoided emissions" : "Extra trees Lindström needs"}</span>
        <span>
          One tree icon = <span className="num text-foreground">{count(scale)}</span> young trees. The step changes with the comparison.
        </span>
      </figcaption>
    </figure>
  );
}
