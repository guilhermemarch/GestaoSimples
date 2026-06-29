import { AppShell } from "@/components/layout/app-shell";
import { ClienteDetailContent } from "./cliente-detail-content";

type Props = { params: Promise<{ id: string }> };

export default async function ClienteDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <AppShell pageTitle="Detalhe do cliente">
      <ClienteDetailContent id={id} />
    </AppShell>
  );
}
