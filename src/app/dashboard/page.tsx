import { AppShell } from "@/components/layout/app-shell";
import { getSessionUser } from "@/lib/auth";
import { DashboardContent } from "./dashboard-content";

export default async function DashboardPage() {
  const user = await getSessionUser();
  const firstName = user?.name.split(" ")[0] ?? "Usuário";

  return (
    <AppShell pageTitle="Dashboard">
      <DashboardContent userName={firstName} />
    </AppShell>
  );
}
