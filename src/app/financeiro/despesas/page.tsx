import { AppShell } from "@/components/layout/app-shell";
import { DespesasContent } from "./despesas-content";

export default function DespesasPage() {
  return (
    <AppShell pageTitle="Despesas">
      <DespesasContent />
    </AppShell>
  );
}
