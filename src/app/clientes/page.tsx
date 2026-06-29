import { AppShell } from "@/components/layout/app-shell";
import { ClientesContent } from "./clientes-content";

export default function ClientesPage() {
  return (
    <AppShell pageTitle="Clientes">
      <ClientesContent />
    </AppShell>
  );
}
