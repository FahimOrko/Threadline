"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { useRoleStore, type Role } from "@/store/role-store";

const views = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/impact", label: "Impact World" },
  { href: "/story", label: "Story" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const role = useRoleStore((s) => s.role);
  const setRole = useRoleStore((s) => s.setRole);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    useRoleStore.persist.rehydrate();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b px-4 py-2">
        <span className="font-semibold">Customer Value Review</span>
        <Button variant="outline" size="sm" disabled>
          Customer: not selected
        </Button>
        <Button variant="outline" size="sm" disabled>
          Baseline: not selected
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <ToggleGroup
            aria-label="Role"
            variant="outline"
            spacing={0}
            value={[role]}
            onValueChange={(v) => v[0] && setRole(v[0] as Role)}
          >
            <ToggleGroupItem value="kam">KAM</ToggleGroupItem>
            <ToggleGroupItem value="customer">Customer</ToggleGroupItem>
          </ToggleGroup>
          <Button
            variant="ghost"
            size="icon"
            aria-label={sidebarOpen ? "Collapse AI sidebar" : "Expand AI sidebar"}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((o) => !o)}
          >
            {sidebarOpen ? <PanelRightClose /> : <PanelRightOpen />}
          </Button>
        </div>
      </header>
      <nav aria-label="Views" className="flex gap-1 border-b px-4 py-2">
        {views.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={buttonVariants({
                variant: active ? "default" : "ghost",
                size: "sm",
              })}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="flex flex-1">
        <main className="flex-1 p-6">{children}</main>
        {sidebarOpen && (
          <>
            <Separator orientation="vertical" />
            <aside aria-label="AI assistant" className="w-80 p-4">
              <h2 className="font-medium">AI assistant</h2>
              <p className="text-sm text-muted-foreground">Coming soon.</p>
            </aside>
          </>
        )}
      </div>
    </div>
  );
}
