"use client";

import { Menu } from "@base-ui/react/menu";
import { Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

// A cut-down shadcn dropdown-menu on base-ui Menu, Phosphor icons only: a trigger, a popup and a single-choice radio list.
export const DropdownMenu = Menu.Root;
export const DropdownMenuTrigger = Menu.Trigger;
export const DropdownMenuRadioGroup = Menu.RadioGroup;

export function DropdownMenuContent({ className, side = "bottom", align = "start", sideOffset = 4, ...props }: Menu.Popup.Props & Pick<Menu.Positioner.Props, "side" | "align" | "sideOffset">) {
  return (
    <Menu.Portal>
      <Menu.Positioner side={side} align={align} sideOffset={sideOffset} className="isolate z-50">
        <Menu.Popup className={cn("min-w-56 origin-(--transform-origin) rounded-lg border bg-popover p-1 text-popover-foreground outline-none", className)} {...props} />
      </Menu.Positioner>
    </Menu.Portal>
  );
}

export function DropdownMenuLabel({ className, ...props }: Menu.GroupLabel.Props) {
  return <Menu.GroupLabel className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)} {...props} />;
}

export function DropdownMenuRadioItem({ className, children, ...props }: Menu.RadioItem.Props) {
  return (
    <Menu.RadioItem className={cn("relative flex cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground", className)} {...props}>
      {children}
      <Menu.RadioItemIndicator render={<span className="absolute right-2 flex size-4 items-center justify-center" />}>
        <Check className="size-4" aria-hidden />
      </Menu.RadioItemIndicator>
    </Menu.RadioItem>
  );
}
