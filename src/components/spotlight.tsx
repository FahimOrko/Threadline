"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * A soft spotlight that follows the pointer over a card (ADR 0025; adapted from React Bits SpotlightCard, no dependency). The colour is `--primary` at low
 * alpha. It is a decoration over the card, never over text that moves, and is hidden under `prefers-reduced-motion`.
 */
export function Spotlight({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      data-slot="spotlight"
      className={cn("group/spot relative rounded-lg", className)}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        ref.current!.style.setProperty("--mx", `${e.clientX - r.left}px`);
        ref.current!.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100 motion-reduce:hidden"
        style={{ background: "radial-gradient(14rem circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklab, var(--primary) 9%, transparent), transparent 70%)" }}
      />
    </div>
  );
}
