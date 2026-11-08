"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { GAME_PATH } from "@/lib/story/game";
import { clearProgress, readProgress, writeProgress } from "@/lib/story/progress";

const viewOf = (sp: URLSearchParams) => (sp.get("view") === "customer" ? "customer" : "kam");

/** Mirrors the game address into sessionStorage (ADR 0033) and restores it on a bare address. Renders nothing; the address stays the source of truth. */
export function GameProgress() {
  const router = useRouter();
  const sp = useSearchParams();
  useEffect(() => {
    const view = viewOf(sp);
    if (!sp.has("scene") && !sp.has("beat")) {
      const stored = readProgress(view, sp.get("customer"));
      if (!stored?.query) return;
      const next = new URLSearchParams(sp);
      for (const [k, v] of new URLSearchParams(stored.query)) if (!sp.has(k)) next.set(k, v);
      router.replace(`${GAME_PATH}?${next.toString().replaceAll("%2C", ",")}`);
      return;
    }
    writeProgress(view, sp, sp.get("scene") === "end");
  }, [sp, router]);
  return null;
}

/** Start over: forgets the stored progress and the ending flag, then follows the link (which drops `ended`). */
export function StartOverLink({ href, view, className }: { href: string; view: "kam" | "customer"; className: string }) {
  return (
    <Link href={href} className={className} onClick={() => clearProgress(view)}>
      Start over
    </Link>
  );
}
