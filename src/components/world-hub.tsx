import Link from "next/link";
import { Drop, Lightning, Lock, Recycle, Tree, Truck, Wind } from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import { Badge } from "@/components/badge";
import { factShowMath } from "@/components/fact-stat-card";
import { ProvenanceChip } from "@/components/provenance-chip";
import { ShowMathPopover } from "@/components/show-math";
import type { Fact } from "@/lib/engine";
import { needsInputHint } from "@/lib/explain";
import { formatCardValue } from "@/lib/format";
import type { Zone } from "@/lib/world";

const ICON: Record<Zone["icon"], Icon> = { Tree, Drop, Wind, Lightning, Recycle, Truck };

// Geometry only. Equal wedges: each takes 360 / count degrees, never a share of data. The ring of the circle is 50% of the box; the hole is HOLE of that.
const HOLE = 0.3;
const GAP_DEG = 0.9;
const LABEL_R = 0.66; // label centre, as a share of the outer radius
const pt = (deg: number, r: number) => `${(50 + 50 * r * Math.cos((deg * Math.PI) / 180)).toFixed(2)}% ${(50 + 50 * r * Math.sin((deg * Math.PI) / 180)).toFixed(2)}%`;

/** The wedge `i` of `n` as a clip-path polygon, starting at 12 o'clock and running clockwise. The arc is sampled every 2 degrees. */
export function wedgePolygon(i: number, n: number): string {
  const span = 360 / n;
  const from = -90 + i * span + GAP_DEG / 2;
  const to = -90 + (i + 1) * span - GAP_DEG / 2;
  const steps = Math.max(2, Math.ceil((to - from) / 2));
  const arc = (r: number, reverse = false) => Array.from({ length: steps + 1 }, (_, k) => pt(reverse ? to - ((to - from) * k) / steps : from + ((to - from) * k) / steps, r));
  return `polygon(${[...arc(1), ...arc(HOLE, true)].join(", ")})`;
}

const centre = (i: number, n: number) => {
  const mid = ((-90 + (i + 0.5) * (360 / n)) * Math.PI) / 180;
  return { x: 50 + 50 * LABEL_R * Math.cos(mid), y: 50 + 50 * LABEL_R * Math.sin(mid), tx: Math.cos(mid) * 6, ty: Math.sin(mid) * 6 };
};

function Figure({ fact }: { fact: Fact | undefined }) {
  if (!fact || fact.value === null)
    return (
      <p className="max-w-[9rem] text-center text-xs text-muted-foreground">
        Needs input{fact ? <span className="block">{needsInputHint(fact)}</span> : null}
      </p>
    );
  return (
    <p className="flex flex-wrap items-baseline justify-center gap-x-1">
      <span className="num text-lg font-medium">{formatCardValue(fact.value, fact.unit)}</span>
      <span className="text-xs text-muted-foreground">{fact.unit}</span>
    </p>
  );
}

/**
 * The Impact World hub (ADR 0031): a circle of equal wedges, one per zone, in registry order. A built zone is one link (the wedge); a zone not built yet keeps its place and reads "Coming soon".
 * Each wedge shows its headline Fact with chip and Show math; the figures sit above the link and only the chip and Show math take the pointer. Nothing here sizes a wedge by data.
 * `hrefFor` gives a built zone's address (params kept).
 */
export function WorldHub({ zones, facts, customerName, hrefFor }: { zones: readonly Zone[]; facts: readonly Fact[]; customerName: string; hrefFor: (zone: Zone) => string }) {
  const n = zones.length;
  return (
    <div data-slot="world-hub" className="relative mx-auto aspect-square w-[min(100%,max(30rem,calc(100dvh-15rem)))] max-w-[38rem]">
      <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-[-4%] size-[108%] text-chart-grid">
        {[0.34, 0.56, 0.78].map((r) => (
          <circle key={r} cx="50" cy="50" r={r * 46} fill="none" stroke="currentColor" strokeWidth="0.15" />
        ))}
        <g className="hub-ring" style={{ transformOrigin: "50% 50%" }}>
          <circle cx="50" cy="50" r="48.5" fill="none" stroke="currentColor" strokeWidth="0.25" />
          {Array.from({ length: n }, (_, k) => {
            const a = ((-90 + k * (360 / n)) * Math.PI) / 180;
            return <line key={k} x1={50 + 47.5 * Math.cos(a)} y1={50 + 47.5 * Math.sin(a)} x2={50 + 49.5 * Math.cos(a)} y2={50 + 49.5 * Math.sin(a)} stroke="currentColor" strokeWidth="0.35" />;
          })}
        </g>
      </svg>
      {zones.map((z, i) => {
        const c = centre(i, n);
        const built = z.status === "built";
        const fact = z.headlineFactId ? facts.find((f) => f.id === z.headlineFactId) : undefined;
        const Glyph = ICON[z.icon];
        const shape = { clipPath: wedgePolygon(i, n) };
        return (
          <div key={z.id} className="hub-wedge-wrap pointer-events-none absolute inset-0" style={{ "--n": i, "--tx": `${c.tx.toFixed(1)}px`, "--ty": `${c.ty.toFixed(1)}px` } as React.CSSProperties}>
            {built ? (
              <Link href={hrefFor(z)} aria-label={`${z.name}: open the zone`} className="hub-wedge pointer-events-auto absolute inset-0 bg-primary/10 transition-colors" style={shape} />
            ) : (
              <div aria-hidden className="hub-wedge absolute inset-0 bg-muted/60" style={shape} />
            )}
            <div className="pointer-events-none absolute flex w-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 text-center" style={{ left: `${c.x}%`, top: `${c.y}%` }}>
              <span className={built ? "flex items-center gap-1.5 text-sm font-medium" : "flex items-center gap-1.5 text-sm font-medium text-muted-foreground"}>
                <Glyph aria-hidden size={18} /> {z.name}
              </span>
              {fact || z.headlineFactId ? <Figure fact={fact} /> : null}
              {fact && (
                <span className="pointer-events-auto flex items-center gap-2">
                  <ProvenanceChip methods={fact.methods} source={fact.source} compact />
                  <ShowMathPopover {...factShowMath(fact)} />
                </span>
              )}
              {!built && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock aria-hidden size={12} /> Coming soon
                </span>
              )}
            </div>
          </div>
        );
      })}
      <div className="pointer-events-none absolute left-1/2 top-1/2 flex w-[26%] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 text-center">
        <p className="text-sm font-medium leading-tight">{customerName}</p>
        <p className="text-xs text-muted-foreground">Your impact on the world</p>
        <Badge variant="accent">Illustration</Badge>
      </div>
    </div>
  );
}
