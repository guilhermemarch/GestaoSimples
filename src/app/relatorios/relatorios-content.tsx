"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Download,
  FileText,
  Package,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/system/metric-card";
import { DataTable } from "@/components/system/data-table";
import { ProductThumbnail } from "@/components/system/avatar";
import { LineChartCard } from "@/components/charts/line-chart-card";
import { DonutChartCard } from "@/components/charts/donut-chart-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/format";

type VendasReport = {
  total: number;
  count: number;
  sales: { id: string; total: number; createdAt: string; customer: { name: string } }[];
};

type ProdutosReport = {
  items: {
    productId: string;
    name: string;
    imageUrl: string | null;
    quantity: number;
    revenue: number;
  }[];
};

type DespesasReport = {
  items: { name: string; value: number; color: string }[];
  total: number;
};

function escapeCsv(value: string | number) {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildReportCsv(
  from: string,
  to: string,
  vendas: VendasReport | null,
  produtos: ProdutosReport | null,
) {
  const lines: string[] = [
    "Relatório de vendas",
    `Período,${escapeCsv(`${formatDate(from)} a ${formatDate(to)}`)}`,
    `Total vendas,${escapeCsv(formatCurrency(vendas?.total ?? 0))}`,
    `Quantidade,${vendas?.count ?? 0}`,
    "",
    "Vendas",
    "Data,Cliente,Valor",
    ...(vendas?.sales ?? []).map(
      (s) =>
        `${escapeCsv(formatDate(s.createdAt))},${escapeCsv(s.customer.name)},${escapeCsv(s.total)}`,
    ),
    "",
    "Produtos mais vendidos",
    "Produto,Quantidade,Receita",
    ...(produtos?.items ?? []).map(
      (p) => `${escapeCsv(p.name)},${p.quantity},${escapeCsv(p.revenue)}`,
    ),
  ];
  return lines.join("\n");
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function RelatoriosContent() {
  const [from, setFrom] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [vendasData, setVendasData] = useState<VendasReport | null>(null);
  const [produtosData, setProdutosData] = useState<ProdutosReport | null>(null);
  const [despesasData, setDespesasData] = useState<DespesasReport | null>(null);
  const [chartData, setChartData] = useState<{
    salesLast7Days: { label: string; value: number }[];
  }>({ salesLast7Days: [] });
  const [loading, setLoading] = useState(true);

  async function loadReports() {
    setLoading(true);
    const params = new URLSearchParams({ from, to });
    try {
      const [vendas, produtos, despesas, dash] = await Promise.all([
        api.get<VendasReport>(`/api/relatorios/vendas?${params}`),
        api.get<ProdutosReport>(`/api/relatorios/produtos-mais-vendidos?${params}`),
        api.get<DespesasReport>(`/api/relatorios/despesas-por-categoria?${params}`),
        api.get<{ salesLast7Days?: { label: string; value: number }[] }>("/api/dashboard"),
      ]);
      setVendasData(vendas);
      setProdutosData(produtos);
      setDespesasData(despesas);
      setChartData({ salesLast7Days: dash.salesLast7Days ?? [] });
    } catch {
      toast.error("Erro ao carregar relatórios");
      setVendasData(null);
      setProdutosData(null);
      setDespesasData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metrics = useMemo(() => {
    const total = vendasData?.total ?? 0;
    const count = vendasData?.count ?? 0;
    const ticket = count > 0 ? total / count : 0;
    const topProduct = produtosData?.items[0];
    return { total, count, ticket, topProduct };
  }, [vendasData, produtosData]);

  const donutData = despesasData?.items ?? [];
  const despesasTotal = despesasData?.total ?? 0;

  const detailItems = useMemo(() => {
    const items = produtosData?.items ?? [];
    const totalRevenue = items.reduce((s, i) => s + i.revenue, 0);
    return items.map((item) => ({
      ...item,
      share: totalRevenue > 0 ? Math.round((item.revenue / totalRevenue) * 100) : 0,
    }));
  }, [produtosData]);

  function handleExportCsv() {
    if (!vendasData && !produtosData) {
      toast.error("Nenhum dado para exportar");
      return;
    }
    const csv = buildReportCsv(from, to, vendasData, produtosData);
    downloadCsv(`relatorio-${from}-${to}.csv`, csv);
    toast.success("Relatório exportado");
  }

  return (
    <>
      <PageHeader
        title="Relatórios"
        description="Análises e indicadores do seu negócio"
        actions={[
          {
            label: "Exportar CSV",
            onClick: handleExportCsv,
            variant: "outline",
            icon: Download,
          },
        ]}
      />

      <div className="mb-5 rounded-lg border border-border bg-card p-3 shadow-card">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 space-y-1">
            <Label className="text-xs">De</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 w-full sm:w-auto" />
          </div>
          <div className="min-w-0 space-y-1">
            <Label className="text-xs">Até</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 w-full sm:w-auto" />
          </div>
          <Button className="h-9 bg-primary hover:bg-primary-hover" onClick={loadReports} disabled={loading}>
            {loading ? "Carregando..." : "Atualizar"}
          </Button>
        </div>
      </div>

      <div className="mb-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
        <MetricCard title="Vendas no período" value={formatCurrency(metrics.total)} icon={TrendingUp} iconClassName="green" />
        <MetricCard title="Quantidade" value={String(metrics.count)} subtitle="vendas realizadas" icon={BarChart3} iconClassName="blue" />
        <MetricCard title="Ticket médio" value={formatCurrency(metrics.ticket)} icon={Wallet} iconClassName="green" />
        <MetricCard
          title="Produto destaque"
          value={metrics.topProduct?.name ?? "—"}
          subtitle={metrics.topProduct ? `${metrics.topProduct.quantity} un.` : undefined}
          icon={Package}
          iconClassName="orange"
        />
      </div>

      <div className="mb-5 grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-3 [&>*]:min-w-0">
        <div className="min-w-0 lg:col-span-1">
          <LineChartCard title="Vendas por dia" data={chartData.salesLast7Days} />
        </div>
        <div className="min-w-0 lg:col-span-1">
          <DonutChartCard
            title="Despesas por categoria"
            data={donutData}
            centerValue={formatCurrency(despesasTotal)}
            centerLabel="Total"
            emptyLabel="Sem despesas no período"
          />
        </div>
        <Card variant="panel" className="min-w-0 shadow-card lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Relatórios rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {[
                { label: "Vendas por cliente", icon: Users, href: "/relatorios" },
                { label: "Estoque baixo", icon: Package, href: "/estoque" },
                { label: "Contas em atraso", icon: FileText, href: "/financeiro/contas-a-receber" },
                { label: "Resultado mensal", icon: BarChart3, href: "/financeiro" },
              ].map((r) => (
                <li key={r.label}>
                  <Link
                    href={r.href}
                    className="flex items-center justify-between py-2 text-sm hover:bg-muted/40"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <r.icon className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate">{r.label}</span>
                    </span>
                    <span className="shrink-0 text-muted-foreground">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <h3 className="mb-3 text-sm font-semibold">Detalhamento por produto</h3>
      {loading ? (
        <p className="text-muted-foreground">Carregando relatório...</p>
      ) : (
        <DataTable
          data={detailItems}
          keyFn={(item) => item.productId}
          columns={[
            {
              key: "name",
              header: "Produto",
              maxWidth: "240px",
              render: (item) => (
                <div className="flex min-w-0 items-center gap-3">
                  <ProductThumbnail
                    name={item.name}
                    index={item.productId.charCodeAt(0)}
                    imageUrl={item.imageUrl}
                  />
                  <span className="truncate font-medium">{item.name}</span>
                </div>
              ),
            },
            { key: "qty", header: "Quantidade", maxWidth: "120px", align: "right", render: (item) => `${item.quantity} un.` },
            { key: "revenue", header: "Receita", maxWidth: "140px", align: "right", render: (item) => formatCurrency(item.revenue) },
            {
              key: "share",
              header: "Participação",
              maxWidth: "200px",
              render: (item) => (
                <div className="flex min-w-0 items-center gap-2">
                  <div className="h-2 min-w-[60px] flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${item.share}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-sm font-medium">{item.share}%</span>
                </div>
              ),
            },
          ]}
          footerText={`Período: ${formatDate(from)} a ${formatDate(to)}`}
        />
      )}

      {vendasData?.sales && vendasData.sales.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-3 text-sm font-semibold">Últimas vendas do período</h3>
          <ul className="space-y-2 rounded-lg border border-border bg-card p-4 shadow-card">
            {vendasData.sales.slice(0, 5).map((sale) => (
              <li key={sale.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0 truncate">
                  {sale.customer.name} — {formatDate(sale.createdAt)}
                </span>
                <Link href={`/vendas/nova`} className="shrink-0 font-medium text-primary">
                  {formatCurrency(sale.total)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
