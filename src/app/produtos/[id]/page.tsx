import { AppShell } from "@/components/layout/app-shell";
import { ProdutoDetailContent } from "./produto-detail-content";

type Props = { params: Promise<{ id: string }> };

export default async function ProdutoDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <AppShell pageTitle="Detalhe do produto">
      <ProdutoDetailContent id={id} />
    </AppShell>
  );
}
