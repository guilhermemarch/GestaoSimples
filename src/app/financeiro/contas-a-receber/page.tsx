import { AppShell } from "@/components/layout/app-shell";
import { ContasReceberContent } from "./contas-receber-content";

export default function ContasReceberPage() {
  return (
    <AppShell pageTitle="Contas a receber">
      <ContasReceberContent />
    </AppShell>
  );
}
