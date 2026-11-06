"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      // React 19 warns about <script> rendered on the client; see the Next guide "Preventing Flash"
      scriptProps={{ type: typeof window === "undefined" ? "text/javascript" : "text/plain" }}
    >
      {children}
    </NextThemesProvider>
  );
}
