"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { formatCardValue } from "@/lib/format";

/**
 * A Fact value that counts up once when it first scrolls into view (ADR 0025, the one number that moves). `text` is the exact display string from
 * `formatCardValue`; the count-up only draws in-between strings with the same formatter and always ends on `text`. Assistive technology and tests
 * read `text` from the first render; the animated string is `aria-hidden`. Under `prefers-reduced-motion` nothing animates. Needs-input values are not passed here.
 */
export function AnimatedValue({ value, unit, text, className }: { value: number; unit?: string; text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true });
  const played = useRef(false);
  // While counting, `drawn` holds the in-between string; otherwise the final `text` is shown, so a new value after a scenario switch never replays.
  const [drawn, setDrawn] = useState<string | null>(null);
  useEffect(() => {
    if (reduced || !inView || played.current) return;
    played.current = true;
    const controls = animate(0, value, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (v) => setDrawn(formatCardValue(v, unit)),
      onComplete: () => setDrawn(null),
    });
    return () => controls.stop();
  }, [reduced, inView, value, unit]);
  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{drawn ?? text}</span>
    </span>
  );
}
