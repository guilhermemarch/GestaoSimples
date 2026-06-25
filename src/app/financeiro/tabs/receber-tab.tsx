"use client";

import { useState } from "react";
import { Copy, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { HorizontalBarChartCard } from "@/components/charts/horizontal-bar-chart-card";
import { LineChartCard } from "@/components/charts/line-chart-card";
import { ActionCard } from "@/components/system/action-card";
import { DataTable } from "@/components/system/data-table";
import { EmptyState } from "@/components/system/empty-state";
import { FilterBar } from "@/components/system/filter-bar";
import { MetricCard } from "@/components/system/metric-card";
import { StatusBadge } from "@/components/system/status-badge";
import { UserAvatar } from "@/components/system/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/format";
import { RECEIVABLE_STATUS_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

export type ReceberData = {
  kpis: {
    emAberto: { value: number; trend: string };
    vencidas: { value: number; count: number };
    parciais: { value: number; count: number };
    recebidoMes: { value: number; trend: string };
  };
  chart30: { label: string; valor: number }[];
  aging: { faixa: string; valor: number; count: number }[];
  items: {
    id: string;
    description: string;
    amount: number;
    paidAmount: number;
    saldo: number;
    dueDate: string;
    status: string;
    customer: { id: string; name: string };
  }[];
};

const STATUS_BADGE: Record<string, "pago" | "pendente" | "vencido" | "parcial"> = {
  PAID: "pago",
  OPEN: "pendente",
  PARTIAL: "parcial",
  OVERDUE: "vencido",
};

type Props = {
  data: ReceberData;
  onRefresh: () => void;
};

function trendDir(trend?: string): "up" | "down" | "neutral" {
  if (!trend) return "neutral";
  if (trend.startsWith("-")) return "down";
  if (trend.startsWith("+")) return "up";
  return "neutral";
}

export function ReceberTab({ data, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [payDialog, setPayDialog] = useState<ReceberData["items"][0] | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [paying, setPaying] = useState(false);

  const { kpis, chart30, aging, items } = data;

  const filtered = items.filter((r) => {
    if (statusFilter === "OVERDUE_ONLY" && r.status !== "OVERDUE") return false;
    if (statusFilter !== "ALL" && statusFilter !== "OVERDUE_ONLY" && r.status !== statusFilter) {
      return false;
    }
    if (
      search &&
      !r.customer.name.toLowerCase().includes(search.toLowerCase()) &&
      !r.description.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  function copyCobranca(r: ReceberData["items"][0]) {
    const text = `Olá ${r.customer.name}, você possui uma pendência de ${formatCurrency(r.saldo)} referente a "${r.description}" com vencimento em ${formatDate(r.dueDate)}.`;
    void navigator.clipboard.writeText(text);
    toast.success("Cobrança copiada para a área de transferência");
  }

  async function handlePay() {
    if (!payDialog) return;
    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    setPaying(true);
    try {
      await api.post(`/api/receivables/${payDialog.id}/pagar`, { amount });
      toast.success("Pagamento registrado");
      setPayDialog(null);
      setPayAmount("");
      onRefresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao registrar pagamento");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
        <MetricCard
          title="Total em aberto"
          value={formatCurrency(kpis.emAberto.value)}
          trend={`${kpis.emAberto.trend} vs mês anterior`}
          trendDirection={trendDir(kpis.emAberto.trend)}
          icon={DollarSign}
          iconClassName="orange"
        />
        <MetricCard
          title="Vencidas"
          value={formatCurrency(kpis.vencidas.value)}
          trend={`${kpis.vencidas.count} contas`}
          trendDirection="down"
          icon={DollarSign}
          iconClassName="red"
        />
        <MetricCard
          title="Parciais"
          value={String(kpis.parciais.count)}
          trend="contas com pagamento parcial"
          trendDirection="neutral"
          icon={DollarSign}
          iconClassName="orange"
        />
        <MetricCard
          title="Recebido no mês"
          value={formatCurrency(kpis.recebidoMes.value)}
          trend={`${kpis.recebidoMes.trend} vs mês anterior`}
          trendDirection={trendDir(kpis.recebidoMes.trend)}
          icon={DollarSign}
          iconClassName="green"
        />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-2 [&>*]:min-w-0">
        <LineChartCard
          title="Recebimentos — últimos 30 dias"
          data={chart30.map((d) => ({ label: d.label, value: d.valor }))}
        />
        <HorizontalBarChartCard title="Aging de contas" data={aging} />
      </div>

      <div className="flex flex-wrap gap-2.5">
        <ActionCard
          label="Nova conta"
          icon={DollarSign}
          href="/financeiro/contas-a-receber"
          linkLabel="Registrar →"
        />
        <ActionCard
          label="Ver vencidas"
          icon={Copy}
          onClick={() => setStatusFilter("OVERDUE_ONLY")}
          linkLabel="Filtrar →"
        />
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar cliente ou descrição..."
        selects={[
          {
            id: "status",
            placeholder: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "ALL", label: "Todos" },
              { value: "OPEN", label: "Em aberto" },
              { value: "OVERDUE", label: "Vencidas" },
              { value: "PARTIAL", label: "Parciais" },
              { value: "PAID", label: "Pagas" },
            ],
          },
        ]}
        onClear={() => {
          setSearch("");
          setStatusFilter("ALL");
        }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma conta encontrada"
          description="Ajuste os filtros ou registre uma nova conta a receber."
          actionLabel="Ir para contas a receber"
          onAction={() => window.location.assign("/financeiro/contas-a-receber")}
        />
      ) : (
        <DataTable
          data={filtered}
          keyFn={(r) => r.id}
          columns={[
            {
              key: "cliente",
              header: "Cliente",
              maxWidth: "200px",
              render: (r) => (
                <div className="flex min-w-0 items-center gap-3">
                  <UserAvatar name={r.customer.name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.customer.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.description}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "valor",
              header: "Saldo",
              maxWidth: "120px",
              align: "right",
              render: (r) => (
                <span className="font-semibold text-primary tabular-nums">
                  {formatCurrency(r.saldo)}
                </span>
              ),
            },
            {
              key: "venc",
              header: "Vencimento",
              maxWidth: "120px",
              render: (r) => formatDate(r.dueDate),
            },
            {
              key: "status",
              header: "Status",
              maxWidth: "110px",
              render: (r) => (
                <StatusBadge
                  label={RECEIVABLE_STATUS_LABELS[r.status] ?? r.status}
                  variant={STATUS_BADGE[r.status] ?? "pendente"}
                />
              ),
            },
            {
              key: "actions",
              header: "",
              maxWidth: "140px",
              align: "right",
              render: (r) =>
                r.status !== "PAID" ? (
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyCobranca(r)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => {
                        setPayDialog(r);
                        setPayAmount(String(r.saldo));
                      }}
                    >
                      Pagar
                    </Button>
                  </div>
                ) : null,
            },
          ]}
          footerText={`${filtered.length} contas exibidas`}
        />
      )}

      <Dialog open={!!payDialog} onOpenChange={(o) => !o && setPayDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar pagamento</DialogTitle>
          </DialogHeader>
          {payDialog && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                {payDialog.customer.name} — saldo {formatCurrency(payDialog.saldo)}
              </p>
              <div className="space-y-2">
                <Label htmlFor="pay-amount">Valor</Label>
                <Input
                  id="pay-amount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayDialog(null)}>
              Cancelar
            </Button>
            <Button onClick={handlePay} disabled={paying}>
              {paying ? "Salvando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
