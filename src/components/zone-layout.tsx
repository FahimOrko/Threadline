import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/badge";
import { factShowMath } from "@/components/fact-stat-card";
import { InfoPopover } from "@/components/info-popover";
import { ShowMathPopover } from "@/components/show-math";
import { buttonVariants } from "@/components/ui/button";
import type { Fact } from "@/lib/engine";

/**
 * The one layout every Impact World zone uses (ADR 0031): the explanation top-left (plain words, the "i" and Show math of the zone's headline Fact), the stage on the left,
 * a compact data card on the right, and a way back to the hub. A later zone only supplies its own text, stage and card.
 */
export function ZoneLayout({ name, text, info, mathFact, backHref, stage, card }: { name: string; /** The plain-words explanation, finished text. */ text: string; /** The "i" text. */ info: string; /** The Fact whose Show math the explanation opens. */ mathFact?: Fact; backHref: string; stage: React.ReactNode; card: React.ReactNode }) {
  return (
    <section data-slot="zone-layout" aria-label={name} className="grid gap-x-4 gap-y-3 lg:grid-cols-[minmax(0,1fr)_20rem] lg:grid-rows-[auto_1fr]">
      <div className="min-w-0 space-y-2 lg:col-start-1 lg:row-start-1">
        <div className="flex flex-wrap items-center gap-3">
          <Link href={backHref} className={buttonVariants({ variant: "outline", size: "sm" })}>
            <ArrowLeft aria-hidden /> All zones
          </Link>
          <h2 className="text-lg font-medium">{name}</h2>
          <Badge variant="accent">Illustration</Badge>
          <InfoPopover text={info} />
          {mathFact && <ShowMathPopover {...factShowMath(mathFact)} />}
        </div>
        <p className="max-w-[70ch] text-sm text-muted-foreground">{text}</p>
      </div>
      <div className="min-w-0 lg:col-start-1 lg:row-start-2">{stage}</div>
      <div className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">{card}</div>
    </section>
  );
}
