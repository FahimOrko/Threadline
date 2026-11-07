"use client";

import { Button } from "@/components/ui/button";

/** Opens the browser print dialog; "Save as PDF" is chosen there. Screen only. */
export function PrintButton() {
  return (
    <Button size="sm" onClick={() => window.print()} className="print:hidden" data-print="hide">
      Print / Save as PDF
    </Button>
  );
}
