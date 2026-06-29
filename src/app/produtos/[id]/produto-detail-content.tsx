"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DollarSign,
  Tag,
  Percent,
  Package,
  AlertTriangle,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { MetricCard } from "@/components/system/metric-card";
import { ProductThumbnail } from "@/components/system/avatar";
import { StatusBadge } from "@/components/system/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, ApiError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  price: number;
  cost: number | null;
  stock: number;
  minStock: number;
  category: string | null;
  imageUrl?: string | null;
  unit: string | null;
  active: boolean;
  createdAt: string;
  _count: { saleItems: number };
};

export function ProdutoDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Product | null>(null);

  useEffect(() => {
    api
      .get<Product>(`/api/products/${id}`)
      .then(setForm)
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : "Produto não encontrado");
        router.push("/produtos");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading || !form) {
    return (
      <div className="page-stack">
        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
        <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 [&>*]:min-w-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3 [&>*]:min-w-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  const cost = form.cost ?? form.price * 0.6;
  const margin = form.price > 0 ? ((form.price - cost) / form.price) * 100 : 0;
  const marginValue = form.price - cost;
  const isLowStock = form.stock > 0 && form.stock <= form.minStock;

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        <Link href="/produtos" className="hover:text-primary">
          Produtos
        </Link>
        {" > "}
        <span>Detalhe do produto</span>
      </p>

      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <ProductThumbnail name={form.name} index={form.id.charCodeAt(0)} imageUrl={form.imageUrl} size="lg" />
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">{form.name}</h1>
            <p className="text-sm text-muted-foreground">
              SKU: {form.sku ?? "—"}
              {form.barcode && (
                <span className="ml-2 inline-flex items-center gap-1">
                  | {form.barcode}
                  <Copy className="h-3 w-3 cursor-pointer" />
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="gap-2 bg-primary hover:bg-primary-hover" asChild>
            <Link href="/estoque">Ajustar estoque</Link>
          </Button>
          <Button variant="outline" className="gap-2 border-primary text-primary" asChild>
            <Link href="/produtos">Editar produto</Link>
          </Button>
        </div>
      </div>

      <div className="mb-5 grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 [&>*]:min-w-0">
        <MetricCard title="Preço de custo" value={formatCurrency(cost)} subtitle="por unidade" icon={DollarSign} iconClassName="green" />
        <MetricCard title="Preço de venda" value={formatCurrency(form.price)} subtitle="por unidade" icon={Tag} iconClassName="green" />
        <MetricCard
          title="Margem estimada"
          value={`${margin.toFixed(2)}%`}
          subtitle={`ou ${formatCurrency(marginValue)}`}
          icon={Percent}
          iconClassName="orange"
        />
        <MetricCard
          title="Estoque atual"
          value={`${form.stock} un.`}
          subtitle={isLowStock ? "Estoque baixo" : undefined}
          icon={Package}
          iconClassName="green"
        />
        <MetricCard
          title="Estoque mínimo"
          value={`${form.minStock} un.`}
          subtitle={`Ideal: ${form.minStock * 2} un.`}
          icon={AlertTriangle}
          iconClassName="orange"
        />
      </div>

      {isLowStock && (
        <div className="mb-5">
          <StatusBadge label="Estoque baixo" variant="estoque-baixo" />
        </div>
      )}

      <div className="mb-5 grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3 [&>*]:min-w-0">
        <Card variant="panel" className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Dados do produto</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["Categoria", form.category ?? "—"],
              ["Unidade", form.unit ?? "un."],
              ["Tipo", "Produto"],
              ["Status", form.active ? "Ativo" : "Inativo"],
              ["Cadastro", new Date(form.createdAt).toLocaleDateString("pt-BR")],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0">
                <p className="text-muted-foreground">{label}</p>
                <p className="truncate font-medium">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card variant="panel" className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Fornecedor</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="font-medium">—</p>
            <p className="mt-2 text-xs text-muted-foreground">Cadastre fornecedor nas configurações</p>
          </CardContent>
        </Card>

        <Card variant="panel" className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Vendas recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{form._count.saleItems} vendas registradas</p>
            <Link href="/relatorios" className="mt-2 inline-block text-sm text-primary hover:underline">
              Ver histórico de vendas
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card variant="panel" className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Histórico de movimentações</CardTitle>
          <span className="text-sm text-muted-foreground">Todos os tipos</span>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma movimentação registrada ainda. Saldo atual: {form.stock} un.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
