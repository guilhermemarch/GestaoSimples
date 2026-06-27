"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, Package, Wrench } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/system/empty-state";
import { FilterBar } from "@/components/system/filter-bar";
import { MetricCard } from "@/components/system/metric-card";
import { StatusBadge, type StatusBadgeVariant } from "@/components/system/status-badge";
import { MoneyValue } from "@/components/system/money-value";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, ApiError } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/format";
import { SERVICE_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type ServiceOrder = {
  id: string;
  description: string;
  status: string;
  laborCost: number;
  total: number;
  estimatedDate: string | null;
  notes: string | null;
  customer: { id: string; name: string };
  items: { id: string; description: string | null; quantity: number; unitPrice: number; subtotal: number; product: { name: string } | null }[];
};

type Customer = {
  id: string;
  name: string;
};

const KANBAN_STATUSES = ["QUOTE", "APPROVED", "IN_PROGRESS", "WAITING_PARTS", "COMPLETED", "DELIVERED"];

const COLUMN_BORDER: Record<string, string> = {
  QUOTE: "border-t-gray-400",
  APPROVED: "border-t-blue-500",
  IN_PROGRESS: "border-t-amber-500",
  WAITING_PARTS: "border-t-orange-500",
  COMPLETED: "border-t-green-500",
  DELIVERED: "border-t-primary",
};

const STATUS_BADGE: Record<string, StatusBadgeVariant> = {
  QUOTE: "neutral",
  APPROVED: "aprovado",
  IN_PROGRESS: "em-andamento",
  WAITING_PARTS: "aguardando-peca",
  COMPLETED: "concluido",
  DELIVERED: "concluido",
};

export function ServicosContent() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ServiceOrder | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [changingStatus, setChangingStatus] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    customerId: "",
    description: "",
    laborCost: "",
    estimatedDate: "",
    notes: "",
  });

  const load = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const url = q ? `/api/service-orders?q=${encodeURIComponent(q)}` : "/api/service-orders";
      const data = await api.get<ServiceOrder[]>(url);
      setOrders(data.filter((o) => o.status !== "CANCELLED"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao carregar ordens");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(search), 300);
    return () => clearTimeout(timer);
  }, [search, load]);

  useEffect(() => {
    if (!createOpen) return;
    api
      .get<Customer[]>("/api/customers")
      .then(setCustomers)
      .catch(() => toast.error("Erro ao carregar clientes"));
  }, [createOpen]);

  async function handleCreate() {
    if (!createForm.customerId || !createForm.description.trim()) {
      toast.error("Cliente e descrição são obrigatórios");
      return;
    }
    setCreating(true);
    try {
      await api.post("/api/service-orders", {
        customerId: createForm.customerId,
        description: createForm.description.trim(),
        laborCost: createForm.laborCost ? Number(createForm.laborCost) : undefined,
        estimatedDate: createForm.estimatedDate || undefined,
        notes: createForm.notes.trim() || undefined,
      });
      toast.success("Ordem de serviço criada");
      setCreateOpen(false);
      setCreateForm({ customerId: "", description: "", laborCost: "", estimatedDate: "", notes: "" });
      load(search);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao criar ordem");
    } finally {
      setCreating(false);
    }
  }

  const filtered = useMemo(() => {
    if (statusFilter === "ALL") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const metrics = useMemo(() => {
    const total = orders.length;
    const emAndamento = orders.filter((o) => o.status === "IN_PROGRESS").length;
    const aguardando = orders.filter((o) => o.status === "WAITING_PARTS").length;
    const concluidas = orders.filter((o) => ["COMPLETED", "DELIVERED"].includes(o.status)).length;
    const valorTotal = orders.reduce((s, o) => s + o.total, 0);
    return { total, emAndamento, aguardando, concluidas, valorTotal };
  }, [orders]);

  async function openDetail(order: ServiceOrder) {
    try {
      const full = await api.get<ServiceOrder>(`/api/service-orders/${order.id}`);
      setDetail(full);
      setNewStatus(full.status);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao carregar detalhes");
    }
  }

  async function handleStatusChange() {
    if (!detail || !newStatus) return;
    setChangingStatus(true);
    try {
      await api.post(`/api/service-orders/${detail.id}/status`, { status: newStatus });
      toast.success("Status atualizado");
      setDetail(null);
      load(search);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao atualizar status");
    } finally {
      setChangingStatus(false);
    }
  }

  function KanbanSkeleton() {
    return (
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-6 lg:overflow-x-auto">
        {KANBAN_STATUSES.map((status) => (
          <div key={status} className="min-w-0 space-y-2 lg:min-w-[200px]">
            <Skeleton className="h-12 w-full rounded-t-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  function getOrderCategory(order: ServiceOrder): { label: string; variant: "info" | "neutral" } {
    const text = `${order.description} ${order.notes ?? ""}`.toLowerCase();
    if (text.includes("comercial") || text.includes("ar condicionado") || text.includes("empresa")) {
      return { label: "Comercial", variant: "info" };
    }
    return { label: "Residencial", variant: "neutral" };
  }

  function OrderCard({ order }: { order: ServiceOrder }) {
    const category = getOrderCategory(order);
    return (
      <Card
        variant="panel"
        className="cursor-pointer shadow-card transition-shadow hover:shadow-card-hover"
        onClick={() => openDetail(order)}
      >
        <CardContent className="p-3">
          <div className="mb-1.5 flex items-start justify-between gap-2">
            <p className="min-w-0 flex-1 text-sm font-medium leading-tight">{order.description}</p>
            <StatusBadge
              label={SERVICE_STATUS_LABELS[order.status] ?? order.status}
              variant={STATUS_BADGE[order.status] ?? "neutral"}
            />
          </div>
          <p className="truncate text-xs text-muted-foreground">{order.customer.name}</p>
          <div className="mt-1">
            <StatusBadge label={category.label} variant={category.variant} />
          </div>
          {order.estimatedDate && (
            <p className="mt-1 text-xs text-muted-foreground">Previsão: {formatDate(order.estimatedDate)}</p>
          )}
          <div className="mt-1.5">
            <MoneyValue value={order.total} className="text-sm font-semibold text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title="Serviços"
       
        description="Acompanhe serviços e reparos em tempo real"
        actions={[{ label: "+ Nova ordem de serviço", onClick: () => setCreateOpen(true) }]}
      />

      <div className="mb-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
        <MetricCard title="Total de OS" value={String(metrics.total)} icon={Wrench} iconClassName="blue" />
        <MetricCard title="Em andamento" value={String(metrics.emAndamento)} icon={Clock} iconClassName="orange" />
        <MetricCard title="Aguardando peça" value={String(metrics.aguardando)} icon={Package} iconClassName="orange" />
        <MetricCard title="Concluídas" value={String(metrics.concluidas)} icon={CheckCircle2} iconClassName="green" />
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
              ...KANBAN_STATUSES.map((s) => ({
                value: s,
                label: SERVICE_STATUS_LABELS[s],
              })),
            ],
          },
        ]}
        onClear={() => {
          setSearch("");
          setStatusFilter("ALL");
        }}
      />

      {loading ? (
        <KanbanSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState title="Nenhuma ordem de serviço" description="As ordens criadas aparecerão aqui" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-6 lg:overflow-x-auto">
            {KANBAN_STATUSES.map((status) => {
              const column = filtered.filter((o) => o.status === status);
              return (
                <div key={status} className="min-w-0 lg:min-w-[200px]">
                  <div
                    className={cn(
                      "mb-2 rounded-t-lg border-t-4 bg-card px-3 py-2 shadow-card",
                      COLUMN_BORDER[status],
                    )}
                  >
                    <p className="text-xs font-semibold text-foreground">
                      {SERVICE_STATUS_LABELS[status]}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{column.length} ordens</p>
                  </div>
                  <div className="space-y-2">
                    {column.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col gap-2 rounded-lg border border-border bg-card px-4 py-3 shadow-card sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {metrics.total} ordens · {formatCurrency(metrics.valorTotal)} em serviços
              </p>
              <p className="text-xs text-muted-foreground">
                {metrics.emAndamento} em andamento · {metrics.aguardando} aguardando peça · {metrics.concluidas} concluídas
              </p>
            </div>
          </div>
        </>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova ordem de serviço</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select
                value={createForm.customerId}
                onValueChange={(v) => setCreateForm({ ...createForm, customerId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Input
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Ex.: Troca de tela — notebook"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Mão de obra (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={createForm.laborCost}
                  onChange={(e) => setCreateForm({ ...createForm, laborCost: e.target.value })}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label>Previsão de entrega</Label>
                <Input
                  type="date"
                  value={createForm.estimatedDate}
                  onChange={(e) => setCreateForm({ ...createForm, estimatedDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={createForm.notes}
                onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                placeholder="Detalhes adicionais"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-primary hover:bg-primary-hover" onClick={handleCreate} disabled={creating}>
              {creating ? "Criando..." : "Criar ordem"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes da ordem</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{detail.description}</p>
                <p className="text-sm text-muted-foreground">{detail.customer.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Mão de obra:</span>{" "}
                  <MoneyValue value={detail.laborCost} />
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span>{" "}
                  <MoneyValue value={detail.total} className="font-semibold text-primary" />
                </div>
                {detail.estimatedDate && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Previsão:</span> {formatDate(detail.estimatedDate)}
                  </div>
                )}
              </div>
              {detail.items.length > 0 && (
                <ul className="space-y-1 text-sm">
                  {detail.items.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>{item.product?.name ?? item.description ?? "Item"}</span>
                      <MoneyValue value={item.subtotal} />
                    </li>
                  ))}
                </ul>
              )}
              {detail.notes && <p className="text-sm text-muted-foreground">{detail.notes}</p>}
              <div className="space-y-2">
                <Label>Alterar status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SERVICE_STATUS_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetail(null)}>
              Fechar
            </Button>
            <Button className="bg-primary hover:bg-primary-hover" onClick={handleStatusChange} disabled={changingStatus}>
              {changingStatus ? "Salvando..." : "Atualizar status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
