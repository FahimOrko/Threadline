import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { generatedSource } from "@/lib/data/generated";

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
  const { customers } = await generatedSource.load();
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><ThemeProvider>
          <AppShell customers={customers.map((c) => ({ customer_id: c.customer_id, name: c.customer_name }))}>
            {children}
          </AppShell>
        </ThemeProvider></body>
    </html>
  );
}
