"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Package, ShoppingCart, TrendingDown, Warehouse } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { MetricCard } from "@/components/system/metric-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, ApiError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import { StockAdjustDialog } from "./components/stock-adjust-dialog";
import { StockPurchaseDialog } from "./components/stock-purchase-dialog";
import { MovementsTab } from "./tabs/movements-tab";
import { ProductsStockTab, type EstoqueResumo, type Product } from "./tabs/products-stock-tab";

const TABS = [
  { id: "atual", label: "Estoque atual" },
  { id: "baixo", label: "Estoque baixo" },
  { id: "movimentacoes", label: "Movimentações" },
  { id: "entradas", label: "Entradas" },
  { id: "ajustes", label: "Ajustes" },
];

type ResumoFull = EstoqueResumo & {
  chartFornecedor: { name: string; value: number; color: string }[];
  lowStockChart: { label: string; valor: number }[];
  kpis: EstoqueResumo["kpis"] & {
    entradasMes: number;
    valorEntradasMes: number;
    ajustesMes: number;
    ajustesNegativosMes: number;
  };
};

export function EstoqueContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [resumo, setResumo] = useState<ResumoFull | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tab, setTab] = useState("atual");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [purchaseProductId, setPurchaseProductId] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(() => {
    const lowStock = tab === "baixo";
    const url = lowStock ? "/api/products?lowStock=true" : "/api/products";
    setLoading(true);
    Promise.all([api.get<Product[]>(url), api.get<ResumoFull>("/api/estoque/resumo")])
      .then(([prods, res]) => {
        setProducts(prods);
        setResumo(res);
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Erro ao carregar"))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, supplierFilter, statusFilter, tab]);

  function handleRefresh() {
    setRefreshKey((k) => k + 1);
    load();
  }

  function openPurchase(productId?: string) {
    setPurchaseProductId(productId);
    setPurchaseOpen(true);
  }

  if (!resumo && loading) {
    return (
      <div className="page-stack">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-4 [&>*]:min-w-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = resumo?.kpis;

  return (
    <>
      <PageHeader
        title="Estoque"
        description="Controle operacional do seu estoque em tempo real."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          className="border-primary text-primary"
          onClick={() => openPurchase()}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Registrar compra
        </Button>
      </div>

      {kpis && (
        <div className="mb-5 grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-4 [&>*]:min-w-0">
          <MetricCard
            title="Valor em estoque"
            value={formatCurrency(kpis.valorEmEstoque)}
            icon={Warehouse}
            iconClassName="green"
          />
          <MetricCard
            title="Itens em estoque"
            value={String(kpis.itensEmEstoque)}
            icon={Package}
            iconClassName="blue"
          />
          <MetricCard
            title="Estoque baixo"
            value={String(kpis.estoqueBaixo)}
            icon={AlertTriangle}
            iconClassName="orange"
          />
          <MetricCard
            title="Movimentações no mês"
            value={String(kpis.movimentacoesMes)}
            icon={TrendingDown}
            iconClassName="blue"
          />
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab} className="mb-5 min-w-0">
        <TabsList
          variant="line"
          className="mb-0 w-full justify-start overflow-x-auto border-b"
        >
          {TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="shrink-0 whitespace-nowrap">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="atual" className="mt-5 min-w-0 space-y-4">
          {resumo && (
            <ProductsStockTab
              mode="atual"
              products={products}
              resumo={resumo}
              loading={loading}
              search={search}
              onSearchChange={setSearch}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              supplierFilter={supplierFilter}
              onSupplierFilterChange={setSupplierFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              page={page}
              onPageChange={setPage}
              onPurchase={openPurchase}
            />
          )}
        </TabsContent>

        <TabsContent value="baixo" className="mt-5 min-w-0 space-y-4">
          {resumo && resumo.lowStockChart.length > 0 && (
            <BarChartCard
              title="Top produtos críticos (% abaixo do mínimo)"
              data={resumo.lowStockChart.map((d) => ({
                label: d.label,
                recebimentos: d.valor,
                despesas: 0,
              }))}
            />
          )}
          {resumo && (
            <ProductsStockTab
              mode="baixo"
              products={products}
              resumo={resumo}
              loading={loading}
              search={search}
              onSearchChange={setSearch}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              supplierFilter={supplierFilter}
              onSupplierFilterChange={setSupplierFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              page={page}
              onPageChange={setPage}
              onPurchase={openPurchase}
            />
          )}
        </TabsContent>

        <TabsContent value="movimentacoes" className="mt-5 min-w-0">
          <MovementsTab mode="movimentacoes" refreshKey={refreshKey} />
        </TabsContent>

        <TabsContent value="entradas" className="mt-5 min-w-0">
          <MovementsTab
            mode="entradas"
            resumoExtra={resumo ?? undefined}
            onPurchase={() => openPurchase()}
            refreshKey={refreshKey}
          />
        </TabsContent>

        <TabsContent value="ajustes" className="mt-5 min-w-0">
          <MovementsTab
            mode="ajustes"
            resumoExtra={resumo ?? undefined}
            onAdjust={() => setAdjustOpen(true)}
            refreshKey={refreshKey}
          />
        </TabsContent>
      </Tabs>

      <StockPurchaseDialog
        open={purchaseOpen}
        onOpenChange={setPurchaseOpen}
        defaultProductId={purchaseProductId}
        onSuccess={handleRefresh}
      />

      <StockAdjustDialog
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        onSuccess={handleRefresh}
      />
    </>
  );
}
