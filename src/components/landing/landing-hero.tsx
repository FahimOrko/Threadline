import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/logo";
import { Reveal } from "@/components/landing/reveal";
import { buttonVariants } from "@/components/ui/button";
import { HERO } from "@/lib/landing-content";
import { cn } from "@/lib/utils";

/** The thread line, drawn once in the right column. Decorative, tokens only. */
function Thread() {
  return (
    <svg aria-hidden viewBox="-8 0 456 300" className="h-auto w-full text-primary" fill="none" stroke="currentColor" strokeLinecap="round">
      <path d="M0 250 C 70 250 80 90 150 110 S 240 250 300 190 S 380 40 440 60" strokeWidth="2.5" className="opacity-40" />
      <path d="M0 250 C 70 250 80 90 150 110 S 240 250 300 190 S 380 40 440 60" strokeWidth="2.5" pathLength="1" strokeDasharray="1" strokeDashoffset="0" className="motion-safe:animate-[thread-draw_1.6s_ease-out_both]" />
      {[[150, 110], [300, 190], [440, 60]].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="6" fill="var(--background)" stroke="currentColor" strokeWidth="2.5" />
      ))}
    </svg>
  );
}

export function LandingHero() {
  return (
    <header className="mx-auto max-w-6xl px-8 pt-8">
      <Logo className="text-lg" />
      <div className="grid grid-cols-12 items-center gap-8 pb-20 pt-20">
        <div className="col-span-7">
          <Reveal>
            <h1 className="text-6xl font-semibold leading-[1.05] tracking-tight text-balance">{HERO.headline}</h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">{HERO.subline}</p>
          </Reveal>
          <Reveal delay={0.2} className="mt-10 flex flex-wrap gap-3">
            <Link href={HERO.kam.href} className={cn(buttonVariants({ size: "lg" }), "h-12 px-6 text-base")}>
              {HERO.kam.label}
              <ArrowRight aria-hidden />
            </Link>
            <Link href={HERO.customer.href} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 px-6 text-base")}>
              {HERO.customer.label}
            </Link>
          </Reveal>
        </div>
        <div className="col-span-5">
          <Thread />
        </div>
      </div>
    </header>
  );
}
