import { AppShell } from "@/components/AppShell";
import { ProductsPage } from "@/components/ProductsPage";

export default function Page() {
  return (
    <AppShell title="Produtos">
      <ProductsPage />
    </AppShell>
  );
}
