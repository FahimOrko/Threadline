"use client";

import { useSyncExternalStore } from "react";
import { isEnded, subscribeProgress } from "./progress";

/** Whether the review ended for this customer in this tab. `null` until the client has read storage (the server and the first client render), so callers show a placeholder, never a locked or an open state too early. */
export function useReviewEnded(view: "kam" | "customer", customer: string | null): boolean | null {
  return useSyncExternalStore(
    subscribeProgress,
    () => isEnded(view, customer),
    () => null,
  );
}
