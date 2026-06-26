"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock, Copy, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
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

type Receivable = {
  id: string;
  description: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: string;
  customer: { id: string; name: string };
};

const STATUS_BADGE: Record<string, "pago" | "pendente" | "vencido" | "parcial"> = {
  PAID: "pago",
  OPEN: "pendente",
  PARTIAL: "parcial",
  OVERDUE: "vencido",
};

const PAGE_SIZE = 10;

export function ContasReceberContent() {
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [payDialog, setPayDialog] = useState<Receivable | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [paying, setPaying] = useState(false);

  function load() {
    setLoading(true);
    api
      .get<Receivable[]>("/api/receivables")
      .then(setReceivables)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Erro ao carregar contas"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return receivables.filter((r) => {
      const matchSearch =
        !search ||
        r.customer.name.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [receivables, search, statusFilter]);

  const metrics = useMemo(() => {
    const emAberto = receivables
      .filter((r) => r.status !== "PAID")
      .reduce((s, r) => s + (r.amount - r.paidAmount), 0);
    const vencidas = receivables.filter((r) => r.status === "OVERDUE").length;
    const parciais = receivables.filter((r) => r.status === "PARTIAL").length;
    const recebidasMes = receivables
      .filter((r) => r.status === "PAID")
      .reduce((s, r) => s + r.paidAmount, 0);
    return { emAberto, vencidas, parciais, recebidasMes };
  }, [receivables]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  function openPayDialog(r: Receivable) {
    setPayDialog(r);
    setPayAmount(String(r.amount - r.paidAmount));
  }

  async function handlePay() {
    if (!payDialog) return;
    setPaying(true);
    try {
      await api.post(`/api/receivables/${payDialog.id}/pagar`, { amount: Number(payAmount) });
      toast.success("Pagamento registrado");
      setPayDialog(null);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao registrar pagamento");
    } finally {
      setPaying(false);
    }
  }

  function copyCobranca(r: Receivable) {
    const saldo = r.amount - r.paidAmount;
    const text = `Olá ${r.customer.name}, você possui uma pendência de ${formatCurrency(saldo)} referente a "${r.description}" com vencimento em ${formatDate(r.dueDate)}.`;
    void navigator.clipboard.writeText(text);
    toast.success("Cobrança copiada para a área de transferência");
  }

  return (
    <>
      <PageHeader
        title="Contas a receber"
       
        description="Acompanhe valores pendentes, vencimentos e cobranças."
        actions={[{
          label: "+ Registrar pagamento",
          onClick: () => {
            const first = filtered.find((r) => r.status !== "PAID");
            if (first) openPayDialog(first);
            else toast.info("Nenhuma conta pendente para registrar");
          },
        }]}
      />

      <div className="mb-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
        <MetricCard title="Em aberto" value={formatCurrency(metrics.emAberto)} icon={DollarSign} iconClassName="orange" />
        <MetricCard
          title="Vencidas"
          value={formatCurrency(
            receivables
              .filter((r) => r.status === "OVERDUE")
              .reduce((s, r) => s + (r.amount - r.paidAmount), 0),
          )}
          subtitle={`${metrics.vencidas} contas`}
          icon={AlertCircle}
          iconClassName="red"
        />
        <MetricCard title="Recebidas no mês" value={formatCurrency(metrics.recebidasMes)} icon={CheckCircle2} iconClassName="green" />
        <MetricCard title="Total a receber" value={formatCurrency(metrics.emAberto)} icon={DollarSign} iconClassName="green" />
      </div>

      <FilterBar
        className="mb-5"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por cliente ou descrição..."
        selects={[
          {
            id: "status",
            placeholder: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "ALL", label: "Todos" },
              { value: "OPEN", label: "Em aberto" },
              { value: "OVERDUE", label: "Vencida" },
              { value: "PARTIAL", label: "Parcial" },
              { value: "PAID", label: "Paga" },
            ],
          },
        ]}
        onClear={() => {
          setSearch("");
          setStatusFilter("ALL");
        }}
      />

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="Nenhuma conta a receber" description="Contas geradas por vendas a prazo aparecerão aqui" />
      ) : (
        <DataTable
          data={paginated}
          keyFn={(r) => r.id}
          columns={[
            {
              key: "customer",
              header: "Cliente",
              maxWidth: "200px",
              render: (r) => (
                <div className="flex min-w-0 items-center gap-3">
                  <UserAvatar name={r.customer.name} size="sm" />
                  <Link href={`/clientes/${r.customer.id}`} className="truncate font-medium text-primary hover:underline">
                    {r.customer.name}
                  </Link>
                </div>
              ),
            },
            { key: "description", header: "Descrição", maxWidth: "200px", render: (r) => <span className="truncate">{r.description}</span> },
            { key: "amount", header: "Valor", maxWidth: "120px", align: "right", render: (r) => formatCurrency(r.amount) },
            {
              key: "remaining",
              header: "Saldo",
              maxWidth: "120px",
              align: "right",
              render: (r) => (
                <span className="font-semibold text-primary">{formatCurrency(r.amount - r.paidAmount)}</span>
              ),
            },
            { key: "dueDate", header: "Vencimento", maxWidth: "130px", render: (r) => (
              <span className={r.status === "OVERDUE" ? "font-medium text-danger" : ""}>
                {formatDate(r.dueDate)}
              </span>
            ) },
            {
              key: "status",
              header: "Status",
              maxWidth: "120px",
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
              maxWidth: "220px",
              align: "right",
              render: (r) =>
                r.status !== "PAID" ? (
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="ghost" className="gap-1 text-muted-foreground" onClick={() => copyCobranca(r)}>
                      <Copy className="h-4 w-4" />
                      <span className="hidden sm:inline">Copiar cobrança</span>
                    </Button>
                    <Button size="sm" variant="outline" className="text-primary" onClick={() => openPayDialog(r)}>
                      <span className="hidden sm:inline">Registrar pagamento</span>
                      <span className="sm:hidden">Pagar</span>
                    </Button>
                  </div>
                ) : null,
            },
          ]}
          pagination={{
            page,
            pageSize: PAGE_SIZE,
            total: filtered.length,
            onPageChange: setPage,
          }}
        />
      )}

      <Dialog open={!!payDialog} onOpenChange={(open) => !open && setPayDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar pagamento</DialogTitle>
          </DialogHeader>
          {payDialog && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {payDialog.customer.name} — saldo: {formatCurrency(payDialog.amount - payDialog.paidAmount)}
              </p>
              <div className="space-y-2">
                <Label>Valor do pagamento</Label>
                <Input type="number" step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayDialog(null)}>
              Cancelar
            </Button>
            <Button className="bg-primary hover:bg-primary-hover" onClick={handlePay} disabled={paying}>
              {paying ? "Salvando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
