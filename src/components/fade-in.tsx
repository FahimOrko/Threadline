"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// One fade per page load: the first FadeIn to mount plays it, and later mounts (moving between sections) do not.
let played = false;

/** Fades a chart section in once on first load (ADR 0025). Off under `prefers-reduced-motion`. */
export function FadeIn({ className, children }: { className?: string; children: React.ReactNode }) {
  const [fade] = useState(() => !played);
  useEffect(() => {
    played = true;
  }, []);
  return <div className={cn(fade && "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-700", className)}>{children}</div>;
}
