import { AppShell } from "@/components/layout/app-shell";
import { CaixaContent } from "./caixa-content";

export default function CaixaPage() {
  return (
    <AppShell pageTitle="Caixa">
      <CaixaContent />
    </AppShell>
  );
}
