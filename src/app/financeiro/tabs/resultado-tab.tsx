"use client";

import { TrendingUp } from "lucide-react";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { GroupedBarChartCard } from "@/components/charts/grouped-bar-chart-card";
import { DataTable } from "@/components/system/data-table";
import { EmptyState } from "@/components/system/empty-state";
import { MetricCard } from "@/components/system/metric-card";
import { StatusBadge } from "@/components/system/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export type ResultadoData = {
  kpis: {
    receita: { value: number; trend: string };
    recebimentos: { value: number; trend: string };
    despesasPagas: { value: number; trend: string };
    resultado: { value: number; trend: string };
  };
  chart6m: { mes: string; receita: number; despesas: number; resultado: number }[];
  chartSemanal: { semana: string; entradas: number; saidas: number }[];
  dre: { linha: string; valor: number; tipo: "entrada" | "saida" | "resultado" }[];
  movimentos: {
    id: string;
    tipo: "entrada" | "saida";
    descricao: string;
    valor: number;
    data: string;
  }[];
};

type Props = {
  data: ResultadoData;
};

function trendDir(trend?: string): "up" | "down" | "neutral" {
  if (!trend) return "neutral";
  if (trend.startsWith("-")) return "down";
  if (trend.startsWith("+")) return "up";
  return "neutral";
}

export function ResultadoTab({ data }: Props) {
  const { kpis, chart6m, chartSemanal, dre, movimentos } = data;
  const resultadoNegativo = kpis.resultado.value < 0;

  const chartSemanalBar = chartSemanal.map((d) => ({
    label: d.semana,
    recebimentos: d.entradas,
    despesas: d.saidas,
  }));

  return (
    <div className="space-y-5">
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
        <MetricCard
          title="Receita (vendas)"
          value={formatCurrency(kpis.receita.value)}
          trend={`${kpis.receita.trend} vs mês anterior`}
          trendDirection={trendDir(kpis.receita.trend)}
          icon={TrendingUp}
          iconClassName="green"
        />
        <MetricCard
          title="Recebimentos"
          value={formatCurrency(kpis.recebimentos.value)}
          trend={`${kpis.recebimentos.trend} vs mês anterior`}
          trendDirection={trendDir(kpis.recebimentos.trend)}
          icon={TrendingUp}
          iconClassName="green"
        />
        <MetricCard
          title="Despesas pagas"
          value={formatCurrency(kpis.despesasPagas.value)}
          trend={`${kpis.despesasPagas.trend} vs mês anterior`}
          trendDirection={trendDir(kpis.despesasPagas.trend)}
          icon={TrendingUp}
          iconClassName="red"
        />
        <MetricCard
          title="Resultado líquido"
          value={formatCurrency(kpis.resultado.value)}
          trend={`${kpis.resultado.trend} vs mês anterior`}
          trendDirection={trendDir(kpis.resultado.trend)}
          icon={TrendingUp}
          iconClassName={resultadoNegativo ? "red" : "green"}
          className={resultadoNegativo ? "border-danger/20" : "border-primary/20"}
        />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-2 [&>*]:min-w-0">
        <GroupedBarChartCard title="Evolução — últimos 6 meses" data={chart6m} />
        <BarChartCard title="Entradas vs saídas por semana" data={chartSemanalBar} />
      </div>

      <Card variant="panel" className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Demonstrativo do mês (DRE simplificada)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {dre.map((linha) => (
              <li
                key={linha.linha}
                className={cn(
                  "flex items-center justify-between py-3 text-sm",
                  linha.tipo === "resultado" && "font-bold",
                )}
              >
                <span className="text-muted-foreground">
                  {linha.tipo === "entrada" && "(+) "}
                  {linha.tipo === "saida" && "(−) "}
                  {linha.tipo === "resultado" && "(=) "}
                  {linha.linha}
                </span>
                <span
                  className={cn(
                    "tabular-nums",
                    linha.tipo === "saida" && "text-danger",
                    linha.tipo === "entrada" && "text-primary",
                    linha.tipo === "resultado" &&
                      (linha.valor < 0 ? "text-danger" : "text-primary"),
                  )}
                >
                  {formatCurrency(linha.valor)}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {movimentos.length === 0 ? (
        <EmptyState
          title="Sem movimentações no mês"
          description="Recebimentos e despesas pagas aparecerão aqui."
        />
      ) : (
        <>
          <h3 className="text-sm font-semibold">Fluxo do mês</h3>
          <DataTable
            data={movimentos}
            keyFn={(m) => `${m.tipo}-${m.id}`}
            columns={[
              {
                key: "tipo",
                header: "Tipo",
                maxWidth: "100px",
                render: (m) => (
                  <StatusBadge
                    label={m.tipo === "entrada" ? "Entrada" : "Saída"}
                    variant={m.tipo === "entrada" ? "entrada" : "despesa"}
                  />
                ),
              },
              {
                key: "desc",
                header: "Descrição",
                maxWidth: "240px",
                render: (m) => <span className="truncate font-medium">{m.descricao}</span>,
              },
              {
                key: "data",
                header: "Data",
                maxWidth: "120px",
                render: (m) => formatDate(m.data),
              },
              {
                key: "valor",
                header: "Valor",
                maxWidth: "120px",
                align: "right",
                render: (m) => (
                  <span
                    className={cn(
                      "font-semibold tabular-nums",
                      m.tipo === "entrada" ? "text-primary" : "text-danger",
                    )}
                  >
                    {m.tipo === "entrada" ? "+" : "−"} {formatCurrency(m.valor)}
                  </span>
                ),
              },
            ]}
            footerText={`${movimentos.length} movimentações no mês`}
          />
        </>
      )}
    </div>
  );
}
