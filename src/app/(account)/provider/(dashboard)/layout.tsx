import { DashboardShell, providerNav } from "@/features/accounts/components/dashboard-shell";

// Overview, Jobs, Checks and Profile share the tradesperson's sidebar.
// Onboarding sits outside this group, as a focused page without it.
export default function ProviderDashboardLayout({ children }: LayoutProps<"/provider">) {
  return (
    <DashboardShell nav={providerNav} navLabel="Your dashboard">
      {children}
    </DashboardShell>
  );
}
