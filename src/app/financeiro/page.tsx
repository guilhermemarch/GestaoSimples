import { AppShell } from "@/components/layout/app-shell";
import { FinanceiroContent } from "./financeiro-content";

export default function FinanceiroPage() {
  return (
    <AppShell pageTitle="Financeiro">
      <FinanceiroContent />
    </AppShell>
  );
}
