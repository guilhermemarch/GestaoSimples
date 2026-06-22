import { AppShell } from "@/components/layout/app-shell";
import { FechamentoContent } from "./fechamento-content";

export default function FechamentoPage() {
  return (
    <AppShell pageTitle="Fechamento de caixa">
      <FechamentoContent />
    </AppShell>
  );
}
