"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDownCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { DonutChartCard } from "@/components/charts/donut-chart-card";
import { ActionCard } from "@/components/system/action-card";
import { DataTable } from "@/components/system/data-table";
import { EmptyState } from "@/components/system/empty-state";
import { FilterBar } from "@/components/system/filter-bar";
import { MetricCard } from "@/components/system/metric-card";
import { StatusBadge } from "@/components/system/status-badge";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/format";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/labels";

export type DespesasResumoData = {
  kpis: {
    totalPendente: { value: number; count: number };
    pagasMes: { value: number; trend: string };
    vencendo7: { value: number; count: number };
    maiorCategoria: { name: string; value: number };
  };
  chart30: { label: string; despesas: number }[];
  donut: { name: string; value: number; color: string }[];
  items: {
    id: string;
    description: string;
    category: string;
    amount: number;
    date: string;
    dueDate: string | null;
    status: string;
    supplier: string | null;
  }[];
};

type Props = {
  data: DespesasResumoData;
  onRefresh: () => void;
};

function trendDir(trend?: string): "up" | "down" | "neutral" {
  if (!trend) return "neutral";
  if (trend.startsWith("-")) return "down";
  if (trend.startsWith("+")) return "up";
  return "neutral";
}

export function DespesasTab({ data, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [markingId, setMarkingId] = useState<string | null>(null);

  const { kpis, chart30, donut, items } = data;

  const categories = [...new Set(items.map((e) => e.category))];

  const filtered = items.filter((e) => {
    if (statusFilter !== "ALL" && e.status !== statusFilter) return false;
    if (categoryFilter !== "ALL" && e.category !== categoryFilter) return false;
    if (
      search &&
      !e.description.toLowerCase().includes(search.toLowerCase()) &&
      !e.supplier?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const chart30Bar = chart30.map((d) => ({
    label: d.label,
    recebimentos: 0,
    despesas: d.despesas,
  }));

  async function markPaid(id: string) {
    setMarkingId(id);
    try {
      await api.put(`/api/expenses/${id}`, { status: "PAID" });
      toast.success("Despesa marcada como paga");
      onRefresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao atualizar despesa");
    } finally {
      setMarkingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
        <MetricCard
          title="Total pendente"
          value={formatCurrency(kpis.totalPendente.value)}
          trend={`${kpis.totalPendente.count} despesas`}
          trendDirection="down"
          icon={ArrowDownCircle}
          iconClassName="orange"
        />
        <MetricCard
          title="Pagas no mês"
          value={formatCurrency(kpis.pagasMes.value)}
          trend={`${kpis.pagasMes.trend} vs mês anterior`}
          trendDirection={trendDir(kpis.pagasMes.trend)}
          icon={ArrowDownCircle}
          iconClassName="red"
        />
        <MetricCard
          title="Vencendo em 7 dias"
          value={formatCurrency(kpis.vencendo7.value)}
          trend={`${kpis.vencendo7.count} despesas`}
          trendDirection="down"
          icon={ArrowDownCircle}
          iconClassName="orange"
        />
        <MetricCard
          title="Maior categoria"
          value={formatCurrency(kpis.maiorCategoria.value)}
          trend={kpis.maiorCategoria.name}
          trendDirection="neutral"
          icon={ArrowDownCircle}
          iconClassName="red"
        />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-2 [&>*]:min-w-0">
        <BarChartCard title="Despesas pagas — últimos 30 dias" data={chart30Bar} />
        <DonutChartCard
          title="Despesas por categoria"
          data={donut}
          centerLabel="Total mês"
          centerValue={formatCurrency(donut.reduce((s, d) => s + d.value, 0))}
          emptyLabel="Sem despesas pagas no mês"
        />
      </div>

      <ActionCard
        label="Nova despesa"
        icon={Plus}
        href="/financeiro/despesas"
        linkLabel="Registrar →"
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar descrição ou fornecedor..."
        selects={[
          {
            id: "status",
            placeholder: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "ALL", label: "Todos" },
              { value: "PENDING", label: "Pendente" },
              { value: "PAID", label: "Paga" },
            ],
          },
          {
            id: "cat",
            placeholder: "Categoria",
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { value: "ALL", label: "Todas" },
              ...categories.map((c) => ({
                value: c,
                label: EXPENSE_CATEGORY_LABELS[c] ?? c,
              })),
            ],
          },
        ]}
        onClear={() => {
          setSearch("");
          setStatusFilter("ALL");
          setCategoryFilter("ALL");
        }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma despesa encontrada"
          description="Ajuste os filtros ou registre uma nova despesa."
          actionLabel="Nova despesa"
          onAction={() => window.location.assign("/financeiro/despesas")}
        />
      ) : (
        <DataTable
          data={filtered}
          keyFn={(e) => e.id}
          columns={[
            {
              key: "desc",
              header: "Descrição",
              maxWidth: "220px",
              render: (e) => (
                <div className="min-w-0">
                  <p className="truncate font-medium">{e.description}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {EXPENSE_CATEGORY_LABELS[e.category] ?? e.category}
                    {e.supplier ? ` · ${e.supplier}` : ""}
                  </p>
                </div>
              ),
            },
            {
              key: "valor",
              header: "Valor",
              maxWidth: "120px",
              align: "right",
              render: (e) => (
                <span className="font-semibold text-danger tabular-nums">
                  {formatCurrency(e.amount)}
                </span>
              ),
            },
            {
              key: "venc",
              header: "Vencimento",
              maxWidth: "120px",
              render: (e) => formatDate(e.dueDate ?? e.date),
            },
            {
              key: "status",
              header: "Status",
              maxWidth: "100px",
              render: (e) => (
                <StatusBadge
                  label={e.status === "PAID" ? "Paga" : "Pendente"}
                  variant={e.status === "PAID" ? "pago" : "pendente"}
                />
              ),
            },
            {
              key: "actions",
              header: "",
              maxWidth: "160px",
              align: "right",
              render: (e) => (
                <div className="flex justify-end gap-1">
                  {e.status === "PENDING" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      disabled={markingId === e.id}
                      onClick={() => markPaid(e.id)}
                    >
                      Marcar paga
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-8" asChild>
                    <Link href="/financeiro/despesas">Editar</Link>
                  </Button>
                </div>
              ),
            },
          ]}
          footerText={`${filtered.length} despesas exibidas`}
        />
      )}
    </div>
  );
}
