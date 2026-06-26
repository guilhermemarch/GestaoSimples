"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AlertTriangle, Pencil, ShoppingCart } from "lucide-react";
import { DonutChartCard } from "@/components/charts/donut-chart-card";
import { AlertBanner } from "@/components/system/alert-banner";
import { DataTable } from "@/components/system/data-table";
import { FilterBar } from "@/components/system/filter-bar";
import { ProductThumbnail } from "@/components/system/avatar";
import { StatusBadge } from "@/components/system/status-badge";
import { Button } from "@/components/ui/button";

export type Product = {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
  minStock: number;
  category: string | null;
  supplier: string | null;
  imageUrl?: string | null;
};

export type EstoqueResumo = {
  kpis: {
    valorEmEstoque: number;
    itensEmEstoque: number;
    estoqueBaixo: number;
    movimentacoesMes: number;
  };
  chartCategoria: { name: string; value: number; color: string }[];
};

function productStatus(p: Product): "sem-estoque" | "estoque-baixo" | "em-estoque" {
  if (p.stock <= 0) return "sem-estoque";
  if (p.stock <= p.minStock) return "estoque-baixo";
  return "em-estoque";
}

type Props = {
  mode: "atual" | "baixo";
  products: Product[];
  resumo: EstoqueResumo;
  loading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (v: string) => void;
  supplierFilter: string;
  onSupplierFilterChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  page: number;
  onPageChange: (p: number) => void;
  onPurchase: (productId?: string) => void;
};

const PAGE_SIZE = 10;

export function ProductsStockTab({
  mode,
  products,
  resumo,
  loading,
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  supplierFilter,
  onSupplierFilterChange,
  statusFilter,
  onStatusFilterChange,
  page,
  onPageChange,
  onPurchase,
}: Props) {
  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))] as string[],
    [products],
  );
  const suppliers = useMemo(
    () => [...new Set(products.map((p) => p.supplier).filter(Boolean))] as string[],
    [products],
  );

  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
  const outOfStock = products.filter((p) => p.stock <= 0);

  const displayProducts = useMemo(() => {
    const base = mode === "baixo" ? lowStockProducts : products;
    return base.filter((p) => {
      if (
        search &&
        !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.sku?.toLowerCase().includes(search.toLowerCase()) &&
        !p.supplier?.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (supplierFilter !== "all" && p.supplier !== supplierFilter) return false;
      if (statusFilter !== "all" && productStatus(p) !== statusFilter) return false;
      return true;
    });
  }, [
    mode,
    lowStockProducts,
    products,
    search,
    categoryFilter,
    supplierFilter,
    statusFilter,
  ]);

  const paginated = displayProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-w-0 space-y-4">
      {mode === "baixo" && lowStockProducts.length > 0 && (
        <AlertBanner
          title={`${lowStockProducts.length} produtos abaixo do estoque mínimo`}
          description="Estes produtos precisam de reposição para evitar ruptura de vendas."
          icon={AlertTriangle}
          linkLabel="Ver produtos >"
          linkHref="/estoque"
          stats={[
            { label: "Produtos abaixo do mínimo", value: String(lowStockProducts.length) },
            { label: "Produto sem estoque", value: String(outOfStock.length) },
            { label: "Total de itens críticos", value: String(lowStockProducts.length) },
          ]}
        />
      )}

      {mode === "atual" && resumo.chartCategoria.length > 0 && (
        <DonutChartCard
          title="Valor em estoque por categoria"
          data={resumo.chartCategoria}
          centerLabel="SKUs"
          centerValue={String(resumo.kpis.itensEmEstoque)}
        />
      )}

      <FilterBar
        searchValue={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Buscar produto, código ou fornecedor..."
        selects={[
          {
            id: "cat",
            placeholder: "Categoria",
            value: categoryFilter,
            onChange: onCategoryFilterChange,
            options: [
              { value: "all", label: "Todas" },
              ...categories.map((c) => ({ value: c, label: c })),
            ],
          },
          {
            id: "supplier",
            placeholder: "Fornecedor",
            value: supplierFilter,
            onChange: onSupplierFilterChange,
            options: [
              { value: "all", label: "Todos" },
              ...suppliers.map((s) => ({ value: s, label: s })),
            ],
          },
          {
            id: "status",
            placeholder: "Status",
            value: statusFilter,
            onChange: onStatusFilterChange,
            options: [
              { value: "all", label: "Todos" },
              { value: "em-estoque", label: "Em estoque" },
              { value: "estoque-baixo", label: "Estoque baixo" },
              { value: "sem-estoque", label: "Sem estoque" },
            ],
          },
        ]}
        showFilterButton
        onClear={() => {
          onSearchChange("");
          onCategoryFilterChange("all");
          onSupplierFilterChange("all");
          onStatusFilterChange("all");
        }}
      />

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <div className="min-w-0 overflow-x-auto">
          <DataTable
            data={paginated}
            keyFn={(p) => p.id}
            pagination={{
              page,
              pageSize: PAGE_SIZE,
              total: displayProducts.length,
              onPageChange,
            }}
            footerText={`Mostrando ${(page - 1) * PAGE_SIZE + 1} a ${Math.min(page * PAGE_SIZE, displayProducts.length)} de ${displayProducts.length} produtos`}
            columns={[
              {
                key: "name",
                header: "Produto",
                maxWidth: "200px",
                render: (p) => (
                  <div className="flex items-center gap-3">
                    <ProductThumbnail name={p.name} index={p.id.charCodeAt(0)} imageUrl={p.imageUrl} />
                    <div className="min-w-0">
                      <Link href={`/produtos/${p.id}`} className="block truncate font-medium hover:text-primary">
                        {p.name}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        CÓD. {p.sku ?? p.id.slice(0, 6)}
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                key: "category",
                header: "Categoria",
                maxWidth: "100px",
                render: (p) => <span className="truncate">{p.category ?? "—"}</span>,
              },
              {
                key: "stock",
                header: "Estoque",
                maxWidth: "90px",
                align: "right",
                render: (p) => (
                  <span className={p.stock <= p.minStock ? "font-semibold text-danger" : ""}>
                    {p.stock} un.
                  </span>
                ),
              },
              {
                key: "min",
                header: "Mínimo",
                maxWidth: "80px",
                align: "right",
                render: (p) => `${p.minStock} un.`,
              },
              {
                key: "supplier",
                header: "Fornecedor",
                maxWidth: "120px",
                render: (p) => <span className="truncate">{p.supplier ?? "—"}</span>,
              },
              {
                key: "status",
                header: "Status",
                maxWidth: "110px",
                render: (p) => {
                  const status = productStatus(p);
                  const labels = {
                    "sem-estoque": "Sem estoque",
                    "estoque-baixo": "Estoque baixo",
                    "em-estoque": "Em estoque",
                  };
                  return <StatusBadge label={labels[status]} variant={status} />;
                },
              },
              {
                key: "actions",
                header: "Ações",
                maxWidth: "90px",
                align: "right",
                render: (p) => (
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary"
                      onClick={() => onPurchase(p.id)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                    <Link href={`/produtos/${p.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}
