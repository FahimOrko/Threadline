"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Briefly rings a card whose Fact value changed after a scenario switch (ADR 0025). "Changed" is the Fact value now against the value this
 * card showed last: no arithmetic. The ring is off under `prefers-reduced-motion`; the first render never flashes.
 */
export function ChangeHighlight({ value, className, children }: { value: number | null; className?: string; children: React.ReactNode }) {
  const last = useRef(value);
  const [flash, setFlash] = useState(0);
  useEffect(() => {
    if (last.current !== value) {
      last.current = value;
      setFlash((n) => n + 1);
    }
  }, [value]);
  // `key` restarts the CSS animation when two changes follow each other.
  return (
    <div key={flash} data-changed={flash > 0 ? "" : undefined} className={cn("rounded-lg", flash > 0 && "motion-safe:animate-[changed_1.2s_ease-out]", className)}>
      {children}
    </div>
  );
}
