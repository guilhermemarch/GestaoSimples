import { AppShell } from "@/components/layout/app-shell";
import { ProdutosContent } from "./produtos-content";

export default function ProdutosPage() {
  return (
    <AppShell pageTitle="Produtos">
      <ProdutosContent />
    </AppShell>
  );
}
