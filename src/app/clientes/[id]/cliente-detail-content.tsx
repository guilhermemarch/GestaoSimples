"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Calendar,
  AlertCircle,
  User,
  DollarSign,
  Pencil,
  MessageSquare,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { MetricCard } from "@/components/system/metric-card";
import { UserAvatar } from "@/components/system/avatar";
import { StatusBadge } from "@/components/system/status-badge";
import { DataTable } from "@/components/system/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
};

type Customer = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  document: string | null;
  address: string | null;
  notes: string | null;
  category: string | null;
  active: boolean;
  createdAt: string;
  pendingAmount?: number;
  receivables?: Receivable[];
  _count: { sales: number };
};

type Sale = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: { quantity: number }[];
};

const STATUS_BADGE: Record<string, "pago" | "pendente" | "vencido"> = {
  PAID: "pago",
  OPEN: "pendente",
  PARTIAL: "pendente",
  OVERDUE: "vencido",
};

const TAG_VARIANTS: Record<string, "vip" | "info" | "novo" | "neutral"> = {
  VIP: "vip",
  Atacado: "info",
  Novo: "novo",
};

function whatsappUrl(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${normalized}`;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function ClienteDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Customer | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    email: "",
    document: "",
    address: "",
    category: "",
  });
  const [notesText, setNotesText] = useState("");
  const [payReceivableId, setPayReceivableId] = useState("");
  const [payAmount, setPayAmount] = useState("");

  const loadCustomer = useCallback(async () => {
    const [customer, salesData] = await Promise.all([
      api.get<Customer>(`/api/customers/${id}`),
      api.get<Sale[]>(`/api/sales?customerId=${id}`).catch(() => [] as Sale[]),
    ]);
    setForm(customer);
    setSales(Array.isArray(salesData) ? salesData : []);
    return customer;
  }, [id]);

  useEffect(() => {
    loadCustomer()
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : "Cliente não encontrado");
        router.push("/clientes");
      })
      .finally(() => setLoading(false));
  }, [loadCustomer, router]);

  if (loading || !form) {
    return (
      <div className="page-stack">
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3 [&>*]:min-w-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  const totalPurchased = sales.reduce((s, sale) => s + sale.total, 0);
  const pendingAmount = form.pendingAmount ?? 0;
  const receivables = form.receivables ?? [];
  const isFrequente = form._count.sales > 3;

  function openEditDialog() {
    setEditForm({
      name: form!.name,
      phone: form!.phone ?? "",
      email: form!.email ?? "",
      document: form!.document ?? "",
      address: form!.address ?? "",
      category: form!.category ?? "",
    });
    setEditOpen(true);
  }

  function openNotesDialog() {
    setNotesText(form!.notes ?? "");
    setNotesOpen(true);
  }

  function openPayDialog() {
    const first = receivables[0];
    if (!first) return;
    setPayReceivableId(first.id);
    setPayAmount(String(first.amount - first.paidAmount));
    setPayOpen(true);
  }

  function onPayReceivableChange(receivableId: string) {
    setPayReceivableId(receivableId);
    const r = receivables.find((item) => item.id === receivableId);
    if (r) setPayAmount(String(r.amount - r.paidAmount));
  }

  async function handleEdit() {
    if (!editForm.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    setSaving(true);
    try {
      const updated = await api.put<Customer>(`/api/customers/${id}`, {
        ...editForm,
        notes: form!.notes,
      });
      setForm((prev) => (prev ? { ...prev, ...updated } : prev));
      toast.success("Cliente atualizado");
      setEditOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao salvar cliente");
    } finally {
      setSaving(false);
    }
  }

  async function handleNotes() {
    setSaving(true);
    try {
      const updated = await api.put<Customer>(`/api/customers/${id}`, {
        name: form!.name,
        phone: form!.phone,
        email: form!.email,
        document: form!.document,
        address: form!.address,
        category: form!.category,
        notes: notesText.trim() || null,
      });
      setForm((prev) => (prev ? { ...prev, ...updated } : prev));
      toast.success("Observação salva");
      setNotesOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao salvar observação");
    } finally {
      setSaving(false);
    }
  }

  async function handlePay() {
    if (!payReceivableId) return;
    setPaying(true);
    try {
      await api.post(`/api/receivables/${payReceivableId}/pagar`, { amount: Number(payAmount) });
      toast.success("Pagamento registrado");
      setPayOpen(false);
      await loadCustomer();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao registrar pagamento");
    } finally {
      setPaying(false);
    }
  }

  const selectedPayReceivable = receivables.find((r) => r.id === payReceivableId);

  return (
    <>
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <UserAvatar name={form.name} size="lg" />
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">{form.name}</h1>
            <p className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
              {form.phone && (
                <span className="inline-flex items-center gap-1.5">
                  {form.phone}
                  <a
                    href={whatsappUrl(form.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-success hover:text-primary-hover"
                    title="Abrir WhatsApp"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                  </a>
                </span>
              )}
              {form.phone && form.document && <span aria-hidden>•</span>}
              {form.document && <span>{form.document}</span>}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {form.category && (
                <StatusBadge
                  label={form.category}
                  variant={TAG_VARIANTS[form.category] ?? "vip"}
                />
              )}
              {isFrequente && <StatusBadge label="Cliente frequente" variant="info" />}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="bg-primary hover:bg-primary-hover" asChild>
            <Link href={`/vendas/nova?customerId=${id}`}>+ Nova venda</Link>
          </Button>
          {receivables.length > 0 && (
            <Button variant="outline" className="gap-2" onClick={openPayDialog}>
              <DollarSign className="h-4 w-4 text-primary" />
              Registrar pagamento
            </Button>
          )}
          <Button variant="outline" className="gap-2" onClick={openEditDialog}>
            <Pencil className="h-4 w-4" />
            Editar cliente
          </Button>
          <Button variant="outline" className="gap-2" onClick={openNotesDialog}>
            <MessageSquare className="h-4 w-4" />
            Adicionar observação
          </Button>
        </div>
      </div>

      <div className="mb-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
        <MetricCard
          title="Total comprado"
          value={formatCurrency(totalPurchased)}
          subtitle={`${form._count.sales} compras realizadas`}
          icon={TrendingUp}
          iconClassName="green"
        />
        <MetricCard
          title="Última compra"
          value={sales[0] ? formatDate(sales[0].createdAt) : "—"}
          subtitle={sales[0] ? formatCurrency(sales[0].total) : undefined}
          icon={Calendar}
          iconClassName="blue"
        />
        <MetricCard
          title="Pendência atual"
          value={formatCurrency(pendingAmount)}
          subtitle={pendingAmount > 0 ? `${receivables.length} título(s) em aberto` : "Sem títulos em aberto"}
          icon={AlertCircle}
          iconClassName={pendingAmount > 0 ? "orange" : "green"}
        />
        <MetricCard
          title="Desde"
          value={formatDate(form.createdAt)}
          subtitle="Cliente cadastrado"
          icon={User}
          iconClassName="green"
        />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3 [&>*]:min-w-0">
        <div className="space-y-4">
          <Card variant="panel" className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Informações pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                ["Nome completo", form.name],
                ["CPF", form.document ?? "—"],
                ["Telefone", form.phone ?? "—"],
                ["E-mail", form.email ?? "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-border pb-2">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="min-w-0 truncate text-right font-medium">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card variant="panel" className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Endereço</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{form.address ?? "—"}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card variant="panel" className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Histórico de vendas</CardTitle>
            </CardHeader>
            <CardContent>
              {sales.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma venda registrada</p>
              ) : (
                <DataTable
                  data={sales}
                  keyFn={(s) => s.id}
                  className="border-0 shadow-none"
                  columns={[
                    { key: "date", header: "Data", maxWidth: "150px", render: (s) => formatDate(s.createdAt) },
                    { key: "id", header: "Nº Venda", maxWidth: "120px", render: (s) => `#${s.id.slice(0, 6)}` },
                    { key: "items", header: "Produtos", maxWidth: "110px", render: (s) => `${s.items?.length ?? 0} itens` },
                    { key: "total", header: "Valor", maxWidth: "120px", align: "right", render: (s) => formatCurrency(s.total) },
                    {
                      key: "status",
                      header: "Status",
                      maxWidth: "120px",
                      render: () => <StatusBadge label="Concluída" variant="concluido" />,
                    },
                  ]}
                />
              )}
            </CardContent>
          </Card>

          <Card variant="panel" className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Observações</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-primary" onClick={openNotesDialog}>
                <Plus className="h-3.5 w-3.5" />
                Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              {form.notes ? (
                <p className="text-sm italic text-muted-foreground">&ldquo;{form.notes}&rdquo;</p>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma observação registrada</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card variant="panel" className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Contas pendentes</CardTitle>
              <Link href="/financeiro/contas-a-receber" className="text-xs text-primary hover:underline">
                Ver todas &gt;
              </Link>
            </CardHeader>
            <CardContent>
              {receivables.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma pendência</p>
              ) : (
                <DataTable
                  data={receivables}
                  keyFn={(r) => r.id}
                  className="border-0 shadow-none"
                  columns={[
                    { key: "desc", header: "Descrição", maxWidth: "160px", render: (r) => r.description },
                    {
                      key: "saldo",
                      header: "Saldo",
                      maxWidth: "120px",
                      align: "right",
                      render: (r) => formatCurrency(r.amount - r.paidAmount),
                    },
                    {
                      key: "due",
                      header: "Vencimento",
                      maxWidth: "130px",
                      render: (r) => (
                        <span className={r.status === "OVERDUE" ? "font-medium text-danger" : ""}>
                          {formatDate(r.dueDate)}
                        </span>
                      ),
                    },
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
                  ]}
                />
              )}
            </CardContent>
          </Card>

          <Card variant="panel" className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Etiquetas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {form.category ? (
                  <StatusBadge
                    label={form.category}
                    variant={TAG_VARIANTS[form.category] ?? "neutral"}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma etiqueta atribuída</p>
                )}
                {isFrequente && <StatusBadge label="Cliente frequente" variant="info" />}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>CPF/CNPJ</Label>
              <Input
                value={editForm.document}
                onChange={(e) => setEditForm({ ...editForm, document: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Etiqueta</Label>
              <Select
                value={editForm.category || "none"}
                onValueChange={(v) => setEditForm({ ...editForm, category: v === "none" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="Atacado">Atacado</SelectItem>
                  <SelectItem value="Novo">Novo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-primary hover:bg-primary-hover" onClick={handleEdit} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar observação</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Observação</Label>
            <Textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Anotações sobre o cliente..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-primary hover:bg-primary-hover" onClick={handleNotes} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar pagamento</DialogTitle>
          </DialogHeader>
          {selectedPayReceivable && (
            <div className="space-y-4">
              {receivables.length > 1 && (
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Select value={payReceivableId} onValueChange={onPayReceivableChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {receivables.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.description} — {formatCurrency(r.amount - r.paidAmount)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Saldo: {formatCurrency(selectedPayReceivable.amount - selectedPayReceivable.paidAmount)}
              </p>
              <div className="space-y-2">
                <Label>Valor do pagamento</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)}>
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
