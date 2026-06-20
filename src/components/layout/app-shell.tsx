import { getSessionUser } from "@/lib/auth";
import { getAlerts } from "@/lib/alerts";
import { redirect } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

type Props = {
  children: React.ReactNode;
  pageTitle?: string;
};

export async function AppShell({ children, pageTitle }: Props) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  let alerts: Awaited<ReturnType<typeof getAlerts>> = [];
  try {
    alerts = await getAlerts(user.companyId);
  } catch {
    // Alerts are non-critical; don't block page render on DB timeouts.
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div
        className="hidden shrink-0 border-r border-border lg:block"
        style={{ width: "var(--sidebar-w)" }}
      >
        <div className="sticky top-0 h-screen">
          <Sidebar user={user} />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} pageTitle={pageTitle} alerts={alerts} />
        <main className="min-w-0 flex-1 bg-background p-4 lg:p-6">
          <div className="content-max">{children}</div>
        </main>
      </div>
    </div>
  );
}
