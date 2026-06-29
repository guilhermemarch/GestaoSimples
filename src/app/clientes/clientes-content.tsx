"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, MoreVertical, Pencil, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/system/data-table";
import { EmptyState } from "@/components/system/empty-state";
import { FilterBar } from "@/components/system/filter-bar";
import { UserAvatar } from "@/components/system/avatar";
import { StatusBadge } from "@/components/system/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api, ApiError } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/format";

type Customer = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  document: string | null;
  category: string | null;
  active: boolean;
  pendingAmount?: number;
  lastSaleDate?: string | null;
  _count: { sales: number };
};

const TAG_VARIANTS: Record<string, "vip" | "info" | "novo" | "neutral"> = {
  VIP: "vip",
  Atacado: "info",
  Novo: "novo",
};

export function ClientesContent() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [pendingFilter, setPendingFilter] = useState("all");
  const [lastPurchaseFilter, setLastPurchaseFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    document: "",
    address: "",
    category: "",
    notes: "",
  });
  const pageSize = 10;

  const loadCustomers = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const url = q ? `/api/customers?q=${encodeURIComponent(q)}` : "/api/customers";
      const data = await api.get<Customer[]>(url);
      setCustomers(data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadCustomers(search), 300);
    return () => clearTimeout(timer);
  }, [search, loadCustomers]);

  useEffect(() => {
    setPage(1);
  }, [search, tagFilter, pendingFilter, lastPurchaseFilter]);

  const filtered = customers.filter((c) => {
    if (tagFilter !== "all" && c.category !== tagFilter) return false;
    const pending = (c.pendingAmount ?? 0) > 0;
    if (pendingFilter === "yes" && !pending) return false;
    if (pendingFilter === "no" && pending) return false;
    if (lastPurchaseFilter !== "all" && c.lastSaleDate) {
      const days = lastPurchaseFilter === "7d" ? 7 : 30;
      const cutoff = Date.now() - days * 86400000;
      if (new Date(c.lastSaleDate).getTime() < cutoff) return false;
    } else if (lastPurchaseFilter !== "all" && !c.lastSaleDate) return false;
    return true;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  async function handleCreate() {
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    setSaving(true);
    try {
      const created = await api.post<Customer>("/api/customers", {
        name: form.name,
        phone: form.phone || null,
        email: form.email || null,
        document: form.document || null,
        address: form.address || null,
        category: form.category || null,
        notes: form.notes || null,
      });
      toast.success("Cliente criado com sucesso");
      setDialogOpen(false);
      setForm({ name: "", phone: "", email: "", document: "", address: "", category: "", notes: "" });
      router.push(`/clientes/${created.id}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao criar cliente");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Gerencie clientes, histórico de compras e pendências."
        actions={[{ label: "+ Novo cliente", onClick: () => setDialogOpen(true) }]}
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome, telefone ou documento..."
        selects={[
          {
            id: "tag",
            placeholder: "Etiqueta",
            value: tagFilter,
            onChange: setTagFilter,
            options: [
              { value: "all", label: "Etiqueta" },
              { value: "VIP", label: "VIP" },
              { value: "Atacado", label: "Atacado" },
              { value: "Novo", label: "Novo" },
            ],
          },
          {
            id: "pending",
            placeholder: "Com pendência",
            value: pendingFilter,
            onChange: setPendingFilter,
            options: [
              { value: "all", label: "Com pendência" },
              { value: "yes", label: "Com pendência" },
              { value: "no", label: "Sem pendência" },
            ],
          },
          {
            id: "last",
            placeholder: "Última compra",
            value: lastPurchaseFilter,
            onChange: setLastPurchaseFilter,
            options: [
              { value: "all", label: "Última compra" },
              { value: "7d", label: "Últimos 7 dias" },
              { value: "30d", label: "Últimos 30 dias" },
            ],
          },
        ]}
        onClear={() => {
          setSearch("");
          setTagFilter("all");
          setPendingFilter("all");
          setLastPurchaseFilter("all");
        }}
        className="mb-5"
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <span className="hidden" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(11) 90000-0000" />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>CPF/CNPJ</Label>
                <Input value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Etiqueta</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="VIP, Novo, Frequente" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Rua, número — bairro, cidade/UF" />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Preferências, notas de relacionamento" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-primary hover:bg-primary-hover" onClick={handleCreate} disabled={saving}>
              {saving ? "Salvando..." : "Criar cliente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nenhum cliente encontrado"
          description="Cadastre seu primeiro cliente para começar"
          actionLabel="Novo cliente"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <DataTable
          data={paginated}
          keyFn={(c) => c.id}
          pagination={{
            page,
            pageSize,
            total: filtered.length,
            onPageChange: setPage,
          }}
          footerText={`Mostrando ${(page - 1) * pageSize + 1} a ${Math.min(page * pageSize, filtered.length)} de ${filtered.length} clientes`}
          columns={[
            {
              key: "name",
              header: "Cliente",
              maxWidth: "260px",
              render: (c) => (
                <div className="flex min-w-0 items-center gap-3">
                  <UserAvatar name={c.name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.email ?? "—"}</p>
                  </div>
                </div>
              ),
            },
            { key: "phone", header: "Telefone", maxWidth: "150px", render: (c) => c.phone ?? "—" },
            { key: "document", header: "Documento", maxWidth: "150px", render: (c) => c.document ?? "—" },
            {
              key: "tag",
              header: "Etiqueta",
              maxWidth: "120px",
              render: (c) =>
                c.category ? (
                  <StatusBadge label={c.category} variant={TAG_VARIANTS[c.category] ?? "neutral"} />
                ) : (
                  "—"
                ),
            },
            {
              key: "pending",
              header: "Pendência",
              maxWidth: "150px",
              align: "right",
              render: (c) => {
                const amount = c.pendingAmount ?? 0;
                if (amount > 0) {
                  return (
                    <span className="text-sm font-medium text-warning">
                      {formatCurrency(amount)}
                    </span>
                  );
                }
                return <span className="text-sm text-success">Sem pendência</span>;
              },
            },
            {
              key: "last",
              header: "Última compra",
              maxWidth: "170px",
              render: (c) => (
                <div className="min-w-0">
                  <p className="truncate text-sm">
                    {c.lastSaleDate ? formatDate(c.lastSaleDate) : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">{c._count.sales} vendas</p>
                </div>
              ),
            },
            {
              key: "actions",
              header: "Ações",
              align: "right",
              render: (c) => (
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/clientes/${c.id}`}
                    className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">Ver detalhes</span>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/clientes/${c.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/clientes/${c.id}`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/vendas/nova?customerId=${c.id}`}>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Nova venda
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ),
            },
          ]}
        />
      )}
    </>
  );
}
