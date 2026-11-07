// Navigation lives in the app sidebar (ADR 0025); the dashboard layout is just the page.
export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return <>{children}</>;
}
