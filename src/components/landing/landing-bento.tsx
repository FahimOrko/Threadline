import { Reveal, Lift } from "@/components/landing/reveal";
import { BENTO, COMING_LATER, type BentoId } from "@/lib/landing-content";
import { cn } from "@/lib/utils";

// Decorative visuals: shapes only, no figures. Tokens through currentColor and the primary and muted tokens.
const bar = "fill-primary/60";
const VISUAL: Record<BentoId, React.ReactNode> = {
  dashboard: (
    <svg aria-hidden viewBox="0 0 576 80" className="h-20 w-full" preserveAspectRatio="xMinYMax meet">
      {[14, 26, 20, 38, 30, 48, 40, 56, 46, 64, 52, 70, 58, 76].map((h, i) => (
        <rect key={i} x={i * 41} y={80 - h} width="26" height={h} rx="3" className={bar} opacity={0.3 + i * 0.05} />
      ))}
    </svg>
  ),
  story: (
    <svg aria-hidden viewBox="0 0 400 96" className="h-24 w-full" preserveAspectRatio="xMinYMax meet">
      <rect x="0" y="0" width="210" height="26" rx="8" className="fill-muted" />
      <rect x="150" y="34" width="250" height="26" rx="8" className={bar} />
      <rect x="0" y="68" width="170" height="26" rx="8" className="fill-muted" />
    </svg>
  ),
  world: (
    <svg aria-hidden viewBox="0 0 80 80" className="h-20 w-20">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d="M40 40 L40 4 A36 36 0 0 1 71.2 22 Z" transform={`rotate(${i * 60} 40 40)`} className={i === 0 ? "fill-primary/60" : "fill-muted"} stroke="var(--card)" strokeWidth="2" />
      ))}
    </svg>
  ),
  export: (
    <svg aria-hidden viewBox="0 0 80 80" className="h-20 w-20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 8h28l14 14v50H20z" className="text-muted-foreground" />
      <path d="M40 34v22m-9-9 9 9 9-9" className="text-primary" />
    </svg>
  ),
  guide: (
    <svg aria-hidden viewBox="0 0 80 80" className="h-20 w-20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="40" cy="40" r="30" className="text-muted-foreground" strokeDasharray="5 7" />
      <path d="M40 29v1m0 9v13" className="text-muted-foreground" />
    </svg>
  ),
};

const TINT: Record<BentoId, string> = {
  dashboard: "bg-primary/5 border-primary/25",
  story: "bg-card",
  world: "bg-muted/50",
  export: "bg-card",
  guide: "bg-card border-dashed",
};

const SPAN: Record<BentoId, string> = {
  dashboard: "col-span-7",
  story: "col-span-5",
  world: "col-span-4",
  export: "col-span-3",
  guide: "col-span-5",
};

/** The five feature cards. The guide card is a plain card: no link, no input. */
export function LandingBento() {
  return (
    <section aria-labelledby="landing-bento" className="mx-auto max-w-6xl px-8 py-20">
      <h2 id="landing-bento" className="mb-10 text-3xl font-semibold tracking-tight">What is inside</h2>
      <div className="grid grid-cols-12 gap-4">
        {BENTO.map((b, i) => (
          <Reveal key={b.id} delay={i * 0.06} className={SPAN[b.id]}>
            <Lift className="h-full">
              <article className={cn("flex h-full min-h-60 flex-col justify-between gap-6 rounded-lg border p-6", TINT[b.id])}>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">{b.title}</h3>
                    {b.comingLater && <span className="rounded-md border px-1.5 py-0.5 text-xs text-muted-foreground">{COMING_LATER}</span>}
                  </div>
                  <p className="mt-2 max-w-md text-muted-foreground">{b.line}</p>
                </div>
                <div className="text-foreground">{VISUAL[b.id]}</div>
              </article>
            </Lift>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
