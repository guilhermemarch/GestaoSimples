import { AppShell } from "@/components/layout/app-shell";
import { ServicosContent } from "./servicos-content";

export default function ServicosPage() {
  return (
    <AppShell pageTitle="Serviços">
      <ServicosContent />
    </AppShell>
  );
}
