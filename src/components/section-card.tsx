import { FactStatCard } from "@/components/fact-stat-card";
import type { Fact } from "@/lib/engine";

/** An Overview headline: a Fact card with one plain line saying what the number means. Equal height in its grid. Phase 2 adds trend, sparkline and comparison. */
export function SectionCard({ fact, meaning }: { fact: Fact; meaning: string }) {
  return <FactStatCard fact={fact} note={meaning} className="h-full" />;
}
