import { adminNav, DashboardShell } from "@/features/accounts/components/dashboard-shell";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <DashboardShell nav={adminNav} navLabel="Team">
      {children}
    </DashboardShell>
  );
}
