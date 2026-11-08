"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/** Fades and lifts its content in once when it scrolls into view. The markup is the same on the server and the client (a branch on reduced motion would break hydration); under `prefers-reduced-motion` the transition has no duration, so the page is static. */
export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={reduce ? { duration: 0 } : { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Lifts a card slightly on hover; static under reduced motion. */
export function Lift({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={cn(className)} whileHover={reduce ? undefined : { y: -3 }} transition={{ duration: 0.2 }}>
      {children}
    </motion.div>
  );
}
