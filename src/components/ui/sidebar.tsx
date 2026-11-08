"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { SidebarSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Ported from the shadcn base-nova `sidebar` item (ADR 0025): desktop only, so no mobile Sheet, input, skeleton or rail. Sub-menus (ADR 0029) are the sidebar-07 pattern without its collapsible: the Story group keeps its own open state.
// The sidebar is sticky inside a flex row instead of fixed with a gap element, so it also works inside the /design gallery.
export const SIDEBAR_COOKIE = "sidebar_state";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type SidebarContext = { state: "expanded" | "collapsed"; open: boolean; setOpen: (open: boolean) => void; toggleSidebar: () => void };
const Ctx = React.createContext<SidebarContext | null>(null);

export function useSidebar() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider.");
  return ctx;
}

/** `open` and `onOpenChange` make it controlled. `onOpenChange` fires only for the user's own toggles (trigger, Ctrl+B), which is also when the cookie is written. */
export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { defaultOpen?: boolean; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [own, setOwn] = React.useState(defaultOpen);
  const open = openProp ?? own;
  const setOpen = React.useCallback(
    (next: boolean) => {
      setOwn(next);
      onOpenChange?.(next);
      document.cookie = `${SIDEBAR_COOKIE}=${next}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
    },
    [onOpenChange],
  );
  const toggleSidebar = React.useCallback(() => setOpen(!open), [open, setOpen]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleSidebar]);

  const value = React.useMemo<SidebarContext>(() => ({ state: open ? "expanded" : "collapsed", open, setOpen, toggleSidebar }), [open, setOpen, toggleSidebar]);
  return (
    <Ctx.Provider value={value}>
      <div
        data-slot="sidebar-wrapper"
        style={{ "--sidebar-width": "14rem", "--sidebar-width-icon": "3.25rem" } as React.CSSProperties}
        className={cn("group/sidebar-wrapper flex min-h-svh w-full", className)}
        {...props}
      >
        {children}
      </div>
    </Ctx.Provider>
  );
}

export function Sidebar({ className, children, ...props }: React.ComponentProps<"aside">) {
  const { state } = useSidebar();
  return (
    <aside
      data-slot="sidebar"
      data-state={state}
      data-collapsible={state === "collapsed" ? "icon" : ""}
      className={cn(
        "group/sidebar sticky top-0 flex h-svh w-(--sidebar-width) shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-linear motion-reduce:transition-none data-[collapsible=icon]:w-(--sidebar-width-icon)",
        className,
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

export function SidebarTrigger({ className, onClick, ...props }: React.ComponentProps<typeof Button>) {
  const { toggleSidebar, open } = useSidebar();
  return (
    <Button
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      className={className}
      aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
      aria-expanded={open}
      onClick={(e) => {
        onClick?.(e);
        toggleSidebar();
      }}
      {...props}
    >
      <SidebarSimple />
    </Button>
  );
}

export function SidebarInset({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-inset" className={cn("flex min-w-0 flex-1 flex-col bg-background", className)} {...props} />;
}

export const SidebarHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div data-slot="sidebar-header" className={cn("flex flex-col gap-2 p-2", className)} {...props} />
);
export const SidebarFooter = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div data-slot="sidebar-footer" className={cn("flex flex-col gap-2 p-2", className)} {...props} />
);
export const SidebarContent = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div data-slot="sidebar-content" className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden group-data-[collapsible=icon]/sidebar:overflow-hidden", className)} {...props} />
);
export const SidebarGroup = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div data-slot="sidebar-group" className={cn("relative flex w-full min-w-0 flex-col p-2", className)} {...props} />
);
export const SidebarSeparator = ({ className, ...props }: React.ComponentProps<typeof Separator>) => (
  <Separator data-slot="sidebar-separator" className={cn("mx-2 w-[calc(100%-1rem)]! bg-sidebar-border", className)} {...props} />
);

export function SidebarGroupLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn(
        "flex h-8 shrink-0 items-center px-2 text-xs font-medium text-muted-foreground transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]/sidebar:-mt-8 group-data-[collapsible=icon]/sidebar:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

export const SidebarMenu = ({ className, ...props }: React.ComponentProps<"ul">) => (
  <ul data-slot="sidebar-menu" className={cn("flex w-full min-w-0 flex-col gap-0.5", className)} {...props} />
);
export const SidebarMenuItem = ({ className, ...props }: React.ComponentProps<"li">) => (
  <li data-slot="sidebar-menu-item" className={cn("relative", className)} {...props} />
);

const menuButton =
  "relative z-10 flex h-8 w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm text-sidebar-foreground outline-hidden ring-sidebar-ring transition-[width,padding] hover:text-sidebar-accent-foreground focus-visible:ring-2 data-active:font-medium data-active:text-sidebar-accent-foreground group-data-[collapsible=icon]/sidebar:size-8 group-data-[collapsible=icon]/sidebar:p-2 [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate";

/** Renders a button, or the element given in `render` (a Link). `isActive` sets `data-active`; pass `aria-current` yourself on links. */
export function SidebarMenuButton({ render, isActive = false, className, ...props }: useRender.ComponentProps<"button"> & { isActive?: boolean }) {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">({ className: cn(menuButton, className) }, props),
    render,
    state: { slot: "sidebar-menu-button", active: isActive },
  });
}

// The nested rows of a group (sidebar-07): indented under the parent with a hairline, hidden when the sidebar is collapsed to icons.
export const SidebarMenuSub = ({ className, ...props }: React.ComponentProps<"ul">) => (
  <ul data-slot="sidebar-menu-sub" className={cn("mx-3 mt-0.5 flex min-w-0 flex-col gap-0.5 border-l border-sidebar-border px-1.5 py-0.5 group-data-[collapsible=icon]/sidebar:hidden", className)} {...props} />
);
export const SidebarMenuSubItem = ({ className, ...props }: React.ComponentProps<"li">) => <li data-slot="sidebar-menu-sub-item" className={cn("relative", className)} {...props} />;

const subButton =
  "flex h-7 w-full min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-left text-sm text-sidebar-foreground outline-hidden ring-sidebar-ring hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground focus-visible:ring-2 data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground [&>span:last-child]:truncate";

/** A sub-row link. `isActive` sets `data-active` (a static fill, no glide); pass `aria-current` yourself. */
export function SidebarMenuSubButton({ render, isActive = false, className, ...props }: useRender.ComponentProps<"a"> & { isActive?: boolean }) {
  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">({ className: cn(subButton, className) }, props),
    render,
    state: { slot: "sidebar-menu-sub-button", active: isActive },
  });
}
