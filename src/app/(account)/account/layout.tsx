import { customerNav, DashboardShell } from "@/features/accounts/components/dashboard-shell";

export default function CustomerAccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <DashboardShell nav={customerNav} navLabel="Your account">
      {children}
    </DashboardShell>
  );
}
