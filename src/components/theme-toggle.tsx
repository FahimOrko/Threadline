"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // false on the server and during hydration: the server cannot know the stored theme
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const dark = mounted ? resolvedTheme === "dark" : true;
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? <Sun /> : <Moon />}
    </Button>
  );
}
