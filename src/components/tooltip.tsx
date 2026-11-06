"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

export function Tooltip({ label, children }: { label: string; children: React.ReactElement }) {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger render={children} />
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Positioner sideOffset={6}>
            <TooltipPrimitive.Popup className="rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground">
              {label}
            </TooltipPrimitive.Popup>
          </TooltipPrimitive.Positioner>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
