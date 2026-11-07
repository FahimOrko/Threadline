import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { generatedSource } from "@/lib/data/generated";
import { PERIOD } from "@/lib/dashboard";
import { baselineShortName, deliverySites, requireValue } from "@/lib/engine";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Threadline",
  description: "Annual value review for Lindström customers",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const data = await generatedSource.load();
  const { customers, baselines } = data;
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col"><ThemeProvider>
          <AppShell customers={customers.map((c) => ({
              customer_id: c.customer_id,
              name: c.customer_name,
              industry: c.industry,
              sites: requireValue(deliverySites(data, { customerId: c.customer_id, period: PERIOD })),
            }))}
            baselines={baselines.map((b) => ({ baseline_id: b.baseline_id, name: baselineShortName(b) }))}
          >
            {children}
          </AppShell>
        </ThemeProvider></body>
    </html>
  );
}
