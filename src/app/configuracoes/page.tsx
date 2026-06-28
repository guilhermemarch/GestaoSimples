import { AppShell } from "@/components/layout/app-shell";
import { ConfiguracoesContent } from "./configuracoes-content";

export default function ConfiguracoesPage() {
  return (
    <AppShell pageTitle="Configurações">
      <ConfiguracoesContent />
    </AppShell>
  );
}
