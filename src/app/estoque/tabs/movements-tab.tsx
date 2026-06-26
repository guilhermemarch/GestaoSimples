"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { DonutChartCard } from "@/components/charts/donut-chart-card";
import { DualLineChartCard } from "@/components/charts/dual-line-chart-card";
import { DataTable } from "@/components/system/data-table";
import { EmptyState } from "@/components/system/empty-state";
import { FilterBar } from "@/components/system/filter-bar";
import { ProductThumbnail } from "@/components/system/avatar";
import { StatusBadge } from "@/components/system/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, ApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type Movement = {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string | null;
  type: string;
  quantity: number;
  balanceAfter: number;
  description: string | null;
  createdAt: string;
};

type ResumoExtra = {
  chartFornecedor?: { name: string; value: number; color: string }[];
  kpis?: {
    entradasMes?: number;
    valorEntradasMes?: number;
    ajustesMes?: number;
    ajustesNegativosMes?: number;
  };
  lowStockChart?: { label: string; valor: number }[];
};

const TYPE_LABELS: Record<string, string> = {
  PURCHASE: "Compra",
  SALE: "Venda",
  ADJUSTMENT: "Ajuste",
};

const TYPE_VARIANT: Record<string, "entrada" | "despesa" | "pendente"> = {
  PURCHASE: "entrada",
  SALE: "despesa",
  ADJUSTMENT: "pendente",
};

type Props = {
  mode: "movimentacoes" | "entradas" | "ajustes";
  resumoExtra?: ResumoExtra;
  onPurchase?: () => void;
  onAdjust?: () => void;
  refreshKey?: number;
};

const PAGE_SIZE = 15;

export function MovementsTab({
  mode,
  resumoExtra,
  onPurchase,
  onAdjust,
  refreshKey = 0,
}: Props) {
  const [items, setItems] = useState<Movement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("30d");
  const [typeFilter, setTypeFilter] = useState("all");

  const fixedType =
    mode === "entradas" ? "PURCHASE" : mode === "ajustes" ? "ADJUSTMENT" : null;

  useEffect(() => {
    setLoading(true);
    const now = new Date();
    const days = period === "7d" ? 7 : 30;
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days).toISOString();

    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
      from,
    });
    if (fixedType) params.set("type", fixedType);
    else if (typeFilter !== "all") params.set("type", typeFilter);
    if (search) params.set("search", search);

    api
      .get<{ items: Movement[]; total: number }>(`/api/stock-movements?${params}`)
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch((err) =>
        toast.error(err instanceof ApiError ? err.message : "Erro ao carregar movimentações"),
      )
      .finally(() => setLoading(false));
  }, [page, period, typeFilter, search, fixedType, refreshKey]);

  const chartData = useMemo(() => {
    const map = new Map<string, { entradas: number; saidas: number }>();
    for (const m of items) {
      const d = new Date(m.createdAt);
      const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      const entry = map.get(label) ?? { entradas: 0, saidas: 0 };
      if (m.quantity > 0) entry.entradas += m.quantity;
      else entry.saidas += Math.abs(m.quantity);
      map.set(label, entry);
    }
    return [...map.entries()]
      .map(([label, v]) => ({ label, ...v }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [items]);

  const entradasKpi = resumoExtra?.kpis?.entradasMes ?? 0;
  const valorEntradas = resumoExtra?.kpis?.valorEntradasMes ?? 0;
  const ajustesNeg = resumoExtra?.kpis?.ajustesNegativosMes ?? 0;

  return (
    <div className="min-w-0 space-y-4">
      {mode === "entradas" && (
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 [&>*]:min-w-0">
          <Card variant="panel" className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Entradas no mês</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{entradasKpi} un.</p>
              <p className="text-sm text-muted-foreground">
                Valor estimado: R$ {valorEntradas.toFixed(2).replace(".", ",")}
              </p>
            </CardContent>
          </Card>
          {resumoExtra?.chartFornecedor && resumoExtra.chartFornecedor.length > 0 && (
            <DonutChartCard
              title="Entradas por fornecedor"
              data={resumoExtra.chartFornecedor}
              emptyLabel="Sem entradas no mês"
            />
          )}
        </div>
      )}

      {mode === "ajustes" && ajustesNeg > 0 && (
        <Card variant="panel" className="border-warning/30 shadow-card">
          <CardContent className="py-4">
            <p className="text-sm font-medium text-warning">
              {ajustesNeg} ajuste(s) negativo(s) neste mês — revise o inventário.
            </p>
          </CardContent>
        </Card>
      )}

      {mode === "movimentacoes" && chartData.length > 0 && (
        <DualLineChartCard title="Movimentações por dia" data={chartData} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <FilterBar
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="Buscar produto ou descrição..."
          selects={[
            {
              id: "period",
              placeholder: "Período",
              value: period,
              onChange: (v) => {
                setPeriod(v);
                setPage(1);
              },
              options: [
                { value: "7d", label: "Últimos 7 dias" },
                { value: "30d", label: "Últimos 30 dias" },
              ],
            },
            ...(mode === "movimentacoes"
              ? [
                  {
                    id: "type",
                    placeholder: "Tipo",
                    value: typeFilter,
                    onChange: (v: string) => {
                      setTypeFilter(v);
                      setPage(1);
                    },
                    options: [
                      { value: "all", label: "Todos" },
                      { value: "PURCHASE", label: "Compra" },
                      { value: "SALE", label: "Venda" },
                      { value: "ADJUSTMENT", label: "Ajuste" },
                    ],
                  },
                ]
              : []),
          ]}
          onClear={() => {
            setSearch("");
            setPeriod("30d");
            setTypeFilter("all");
            setPage(1);
          }}
        />
        {mode === "entradas" && onPurchase && (
          <Button onClick={onPurchase}>
            <Plus className="mr-2 h-4 w-4" />
            Nova entrada
          </Button>
        )}
        {mode === "ajustes" && onAdjust && (
          <Button variant="outline" onClick={onAdjust}>
            <Plus className="mr-2 h-4 w-4" />
            Novo ajuste
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : items.length === 0 ? (
        <EmptyState
          title="Nenhuma movimentação encontrada"
          description="Registre uma compra ou ajuste para ver o histórico."
          actionLabel={mode === "ajustes" ? "Novo ajuste" : "Registrar compra"}
          onAction={mode === "ajustes" ? onAdjust : onPurchase}
        />
      ) : (
        <div className="min-w-0 overflow-x-auto">
          <DataTable
            data={items}
            keyFn={(m) => m.id}
            pagination={{
              page,
              pageSize: PAGE_SIZE,
              total,
              onPageChange: setPage,
            }}
            footerText={`${total} movimentações`}
            columns={[
              {
                key: "data",
                header: "Data",
                maxWidth: "100px",
                render: (m) => formatDate(m.createdAt),
              },
              {
                key: "produto",
                header: "Produto",
                maxWidth: "180px",
                render: (m) => (
                  <div className="flex items-center gap-2">
                    <ProductThumbnail
                      name={m.productName}
                      index={m.productId.charCodeAt(0)}
                      imageUrl={m.productImageUrl}
                    />
                    <span className="truncate font-medium">{m.productName}</span>
                  </div>
                ),
              },
              {
                key: "tipo",
                header: "Tipo",
                maxWidth: "90px",
                render: (m) => (
                  <StatusBadge
                    label={TYPE_LABELS[m.type] ?? m.type}
                    variant={TYPE_VARIANT[m.type] ?? "pendente"}
                  />
                ),
              },
              {
                key: "qtd",
                header: "Qtd",
                maxWidth: "80px",
                align: "right",
                render: (m) => (
                  <span
                    className={cn(
                      "font-semibold tabular-nums",
                      m.quantity > 0 ? "text-primary" : "text-danger",
                    )}
                  >
                    {m.quantity > 0 ? "+" : ""}
                    {m.quantity}
                  </span>
                ),
              },
              {
                key: "saldo",
                header: "Saldo",
                maxWidth: "80px",
                align: "right",
                render: (m) => `${m.balanceAfter} un.`,
              },
              {
                key: "desc",
                header: "Descrição",
                maxWidth: "200px",
                render: (m) => (
                  <span className="truncate text-muted-foreground">{m.description ?? "—"}</span>
                ),
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}
