"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Package } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/system/data-table";
import { EmptyState } from "@/components/system/empty-state";
import { FilterBar } from "@/components/system/filter-bar";
import { MoneyValue } from "@/components/system/money-value";
import { ProductThumbnail } from "@/components/system/avatar";
import { StatusBadge, type StatusBadgeVariant } from "@/components/system/status-badge";
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

type Product = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  price: number;
  stock: number;
  minStock: number;
  category: string | null;
  imageUrl?: string | null;
  active: boolean;
};

function stockStatus(p: Product): { label: string; variant: StatusBadgeVariant } {
  if (p.stock <= 0) return { label: "Sem estoque", variant: "sem-estoque" };
  if (p.stock <= p.minStock) return { label: "Estoque baixo", variant: "estoque-baixo" };
  return { label: "Em estoque", variant: "em-estoque" };
}

export function ProdutosContent() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", sku: "", price: "", stock: "0", minStock: "5", category: "", supplier: "" });
  const pageSize = 10;

  const loadProducts = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (lowStockOnly) params.set("lowStock", "true");
      const url = `/api/products${params.toString() ? `?${params}` : ""}`;
      const data = await api.get<Product[]>(url);
      setProducts(data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }, [lowStockOnly]);

  useEffect(() => {
    const timer = setTimeout(() => loadProducts(search), 300);
    return () => clearTimeout(timer);
  }, [search, loadProducts]);

  const filtered = products.filter((p) => {
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    if (statusFilter === "active" && !p.active) return false;
    if (statusFilter === "inactive" && p.active) return false;
    return true;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  async function handleCreate() {
    if (!form.name.trim() || !form.price) {
      toast.error("Nome e preço são obrigatórios");
      return;
    }
    setSaving(true);
    try {
      const created = await api.post<Product>("/api/products", {
        name: form.name,
        sku: form.sku || null,
        price: Number(form.price),
        stock: Number(form.stock),
        minStock: Number(form.minStock),
        category: form.category || null,
        supplier: form.supplier || null,
      });
      toast.success("Produto criado com sucesso");
      setDialogOpen(false);
      router.push(`/produtos/${created.id}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao criar produto");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Produtos"
       
        description="Cadastre produtos, acompanhe preços e controle estoque."
        actions={[{ label: "+ Novo produto", onClick: () => setDialogOpen(true) }]}
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome, SKU ou código de barras..."
        selects={[
          {
            id: "cat",
            placeholder: "Todas as categorias",
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { value: "all", label: "Todas as categorias" },
              { value: "Alimentos e Bebidas", label: "Alimentos e Bebidas" },
              { value: "Bebidas", label: "Bebidas" },
            ],
          },
          {
            id: "status",
            placeholder: "Todos os status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "all", label: "Todos os status" },
              { value: "active", label: "Ativos" },
              { value: "inactive", label: "Inativos" },
            ],
          },
        ]}
        onClear={() => {
          setSearch("");
          setCategoryFilter("all");
          setStatusFilter("all");
          setLowStockOnly(false);
        }}
        className="mb-5"
      >
        <Button
          variant={lowStockOnly ? "default" : "outline"}
          size="sm"
          className="h-9 gap-2"
          onClick={() => setLowStockOnly(!lowStockOnly)}
        >
          Estoque baixo
        </Button>
      </FilterBar>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo produto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ex: Bebidas" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="Nome do fornecedor" />
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Preço *</Label>
                <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Estoque</Label>
                <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Mínimo</Label>
                <Input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button className="bg-primary hover:bg-primary-hover" onClick={handleCreate} disabled={saving}>
              {saving ? "Salvando..." : "Criar produto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="Nenhum produto encontrado" actionLabel="Novo produto" onAction={() => setDialogOpen(true)} />
      ) : (
        <DataTable
          data={paginated}
          keyFn={(p) => p.id}
          pagination={{ page, pageSize, total: filtered.length, onPageChange: setPage }}
          footerText={`Exibindo ${(page - 1) * pageSize + 1} a ${Math.min(page * pageSize, filtered.length)} de ${filtered.length} produtos`}
          columns={[
            {
              key: "name",
              header: "Produto",
              maxWidth: "240px",
              render: (p) => (
                <div className="flex items-center gap-3">
                  <ProductThumbnail name={p.name} index={p.id.charCodeAt(0)} imageUrl={p.imageUrl} />
                  <div className="min-w-0">
                    <Link href={`/produtos/${p.id}`} className="block truncate font-medium hover:text-primary">
                      {p.name}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      SKU: {p.sku ?? "—"} {p.barcode ? `| ${p.barcode}` : ""}
                    </p>
                  </div>
                </div>
              ),
            },
            { key: "category", header: "Categoria", maxWidth: "140px", render: (p) => <span className="truncate">{p.category ?? "—"}</span> },
            {
              key: "stock",
              header: "Estoque",
              maxWidth: "100px",
              align: "right",
              render: (p) => (
                <span className={p.stock <= 0 ? "font-medium text-danger" : ""}>{p.stock} un.</span>
              ),
            },
            { key: "price", header: "Preço", maxWidth: "120px", align: "right", render: (p) => <MoneyValue value={p.price} /> },
            {
              key: "status",
              header: "Status",
              maxWidth: "130px",
              render: (p) => {
                const st = stockStatus(p);
                return <StatusBadge label={st.label} variant={st.variant} />;
              },
            },
            {
              key: "actions",
              header: "Ações",
              align: "right",
              render: (p) => (
                <div className="flex items-center justify-end gap-3">
                  <Link href={`/produtos/${p.id}`} className="flex items-center gap-1 text-sm text-primary hover:underline">
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Ver detalhes</span>
                  </Link>
                  <Link href={`/estoque`} className="hidden items-center gap-1 text-sm text-primary hover:underline sm:flex">
                    <Package className="h-3.5 w-3.5" />
                    Ajustar
                  </Link>
                </div>
              ),
            },
          ]}
        />
      )}
    </>
  );
}
