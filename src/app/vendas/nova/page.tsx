import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { NovaVendaContent } from "./nova-venda-content";

export default function NovaVendaPage() {
  return (
    <AppShell pageTitle="Nova venda">
      <Suspense fallback={<p className="text-muted-foreground">Carregando...</p>}>
        <NovaVendaContent />
      </Suspense>
    </AppShell>
  );
}
