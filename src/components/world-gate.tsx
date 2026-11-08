"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Lock } from "@phosphor-icons/react";
import { Panel } from "@/components/panel";
import { StatCardSkeleton } from "@/components/states";
import { buttonVariants } from "@/components/ui/button";
import { markEnded } from "@/lib/story/progress";
import { useReviewEnded } from "@/lib/story/use-review-ended";

/**
 * The customer-view gate on Impact World (ADR 0033): a UI convenience over synthetic data, not access control.
 * Until the client has read storage it renders the neutral skeleton, so neither the locked panel nor the content flashes.
 * `ended` is true when the address holds `ended=1`, which always opens the page and records the ending.
 */
export function WorldGate({ view, customer, ended, hint, gameHref, children }: { view: "kam" | "customer"; customer: string | null; ended: boolean; hint: string; gameHref: string; children: React.ReactNode }) {
  const reached = useReviewEnded(view, customer);
  useEffect(() => {
    if (view === "customer" && ended) markEnded(view, customer);
  }, [view, customer, ended]);
  if (view === "kam") return children;
  if (reached === null && !ended) return <StatCardSkeleton />;
  if (reached || ended) return children;
  return (
    <Panel className="flex flex-col items-center gap-2 py-10 text-center" data-slot="world-locked">
      <Lock aria-hidden size={24} className="text-muted-foreground" />
      <p className="text-sm font-medium">{hint}</p>
      <p className="max-w-[45ch] text-sm text-muted-foreground">The Impact World shows what your year with us means for the world around you. It opens when you have been through the review.</p>
      <Link href={gameHref} className={buttonVariants({ variant: "outline", size: "sm" })}>
        Go to the review
      </Link>
    </Panel>
  );
}
