"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  Lightbulb,
  Package,
  Receipt,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/system/data-table";
import { EmptyState } from "@/components/system/empty-state";
import { FilterBar } from "@/components/system/filter-bar";
import { MetricCard } from "@/components/system/metric-card";
import { StatusBadge } from "@/components/system/status-badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, ApiError } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/format";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/labels";

type Expense = {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  dueDate: string | null;
  status: string;
  supplier: string | null;
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  RENT: Building2,
  ENERGY: Zap,
  INTERNET: Lightbulb,
  SALARY: Users,
  SUPPLIER: Package,
  MAINTENANCE: Wrench,
  TAX: Receipt,
  OTHER: Receipt,
};

const PAGE_SIZE = 10;

export function DespesasContent() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "OTHER",
    date: new Date().toISOString().slice(0, 10),
    dueDate: "",
    supplier: "",
  });

  function load() {
    setLoading(true);
    api
      .get<Expense[]>("/api/expenses")
      .then(setExpenses)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Erro ao carregar despesas"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch =
        !search ||
        e.description.toLowerCase().includes(search.toLowerCase()) ||
        (e.supplier?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchCategory = categoryFilter === "ALL" || e.category === categoryFilter;
      const matchStatus = statusFilter === "ALL" || e.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [expenses, search, categoryFilter, statusFilter]);

  const metrics = useMemo(() => {
    const totalMes = expenses.reduce((s, e) => s + e.amount, 0);
    const pagas = expenses.filter((e) => e.status === "PAID").reduce((s, e) => s + e.amount, 0);
    const pendentes = expenses.filter((e) => e.status === "PENDING").length;
    const vencidas = expenses.filter(
      (e) => e.status === "PENDING" && e.dueDate && new Date(e.dueDate) < new Date(),
    ).length;
    return { totalMes, pagas, pendentes, vencidas };
  }, [expenses]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, statusFilter]);

  async function handleCreate() {
    if (!form.description || !form.amount) {
      toast.error("Descrição e valor são obrigatórios");
      return;
    }
    setSaving(true);
    try {
      await api.post("/api/expenses", {
        description: form.description,
        amount: Number(form.amount),
        category: form.category,
        date: form.date,
        dueDate: form.dueDate || null,
        supplier: form.supplier || null,
      });
      toast.success("Despesa registrada");
      setDialogOpen(false);
      setForm({
        description: "",
        amount: "",
        category: "OTHER",
        date: new Date().toISOString().slice(0, 10),
        dueDate: "",
        supplier: "",
      });
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao registrar despesa");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Despesas"
       
        description="Registre, acompanhe e marque despesas como pagas."
        actions={[{ label: "+ Nova despesa", onClick: () => setDialogOpen(true) }]}
      />

      <div className="mb-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
        <MetricCard
          title="Total no mês"
          value={formatCurrency(metrics.totalMes)}
          icon={Receipt}
          iconClassName="red"
        />
        <MetricCard
          title="Pagas"
          value={formatCurrency(metrics.pagas)}
          icon={CheckCircle2}
          iconClassName="green"
        />
        <MetricCard
          title="Pendentes"
          value={String(metrics.pendentes)}
          subtitle="despesas"
          icon={Clock}
          iconClassName="orange"
        />
        <MetricCard
          title="Vencidas"
          value={String(metrics.vencidas)}
          subtitle="precisam de atenção"
          icon={AlertCircle}
          iconClassName="red"
        />
      </div>

      <div className="mb-5">
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar por descrição ou fornecedor..."
          selects={[
            {
              id: "category",
              placeholder: "Categoria",
              value: categoryFilter,
              onChange: setCategoryFilter,
              options: [
                { value: "ALL", label: "Todas" },
                ...Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
              ],
            },
            {
              id: "status",
              placeholder: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: "ALL", label: "Todos" },
                { value: "PAID", label: "Paga" },
                { value: "PENDING", label: "Pendente" },
              ],
            },
          ]}
          onClear={() => {
            setSearch("");
            setCategoryFilter("ALL");
            setStatusFilter("ALL");
          }}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova despesa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Descrição *</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Valor *</Label>
                  <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(EXPENSE_CATEGORY_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Vencimento</Label>
                  <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="bg-primary hover:bg-primary-hover" onClick={handleCreate} disabled={saving}>
                {saving ? "Salvando..." : "Registrar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="Nenhuma despesa registrada" actionLabel="Nova despesa" onAction={() => setDialogOpen(true)} />
      ) : (
        <DataTable
          data={paginated}
          keyFn={(e) => e.id}
          columns={[
            {
              key: "description",
              header: "Descrição",
              maxWidth: "240px",
              render: (e) => {
                const Icon = CATEGORY_ICONS[e.category] ?? Receipt;
                return (
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{e.description}</p>
                      {e.supplier && <p className="truncate text-xs text-muted-foreground">{e.supplier}</p>}
                    </div>
                  </div>
                );
              },
            },
            { key: "category", header: "Categoria", maxWidth: "150px", render: (e) => EXPENSE_CATEGORY_LABELS[e.category] ?? e.category },
            { key: "amount", header: "Valor", maxWidth: "120px", align: "right", render: (e) => <span className="font-semibold text-danger">{formatCurrency(e.amount)}</span> },
            { key: "date", header: "Data", maxWidth: "120px", render: (e) => formatDate(e.date) },
            { key: "dueDate", header: "Vencimento", maxWidth: "130px", render: (e) => (e.dueDate ? formatDate(e.dueDate) : "—") },
            {
              key: "status",
              header: "Status",
              maxWidth: "120px",
              render: (e) => (
                <StatusBadge label={e.status === "PAID" ? "Paga" : "Pendente"} variant={e.status === "PAID" ? "pago" : "pendente"} />
              ),
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
    </>
  );
}
