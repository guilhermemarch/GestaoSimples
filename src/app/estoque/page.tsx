import { AppShell } from "@/components/layout/app-shell";
import { EstoqueContent } from "./estoque-content";

export default function EstoquePage() {
  return (
    <AppShell pageTitle="Estoque">
      <EstoqueContent />
    </AppShell>
  );
}
