import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";
import { donutPalette } from "@/components/charts/chart-tokens";

export async function GET() {
  return withAuth(async (user) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const products = await prisma.product.findMany({
      where: { companyId: user.companyId, active: true },
      select: {
        id: true,
        name: true,
        stock: true,
        minStock: true,
        price: true,
        cost: true,
        category: true,
        supplier: true,
      },
    });

    const productIds = products.map((p) => p.id);

    const movimentacoesMes = await prisma.stockMovement.count({
      where: {
        productId: { in: productIds },
        createdAt: { gte: startOfMonth },
      },
    });

    const valorEmEstoque = products.reduce(
      (sum, p) => sum + p.stock * (p.cost ?? p.price),
      0,
    );
    const itensEmEstoque = products.filter((p) => p.stock > 0).length;
    const estoqueBaixo = products.filter((p) => p.stock <= p.minStock).length;

    const categoryMap = new Map<string, number>();
    for (const p of products) {
      const cat = p.category ?? "Sem categoria";
      categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + p.stock * (p.cost ?? p.price));
    }

    const chartCategoria = [...categoryMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value], i) => ({
        name,
        value,
        color: donutPalette[i % donutPalette.length],
      }));

    const lowStock = products
      .filter((p) => p.stock <= p.minStock)
      .map((p) => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        minStock: p.minStock,
        deficitPct:
          p.minStock > 0
            ? Math.round(((p.minStock - p.stock) / p.minStock) * 100)
            : 100,
      }))
      .sort((a, b) => b.deficitPct - a.deficitPct)
      .slice(0, 10);

    const supplierMap = new Map<string, number>();
    const monthMovements = await prisma.stockMovement.findMany({
      where: {
        productId: { in: productIds },
        type: "PURCHASE",
        createdAt: { gte: startOfMonth },
      },
      include: { product: { select: { supplier: true, cost: true, price: true } } },
    });

    for (const m of monthMovements) {
      const supplier = m.product.supplier ?? "Sem fornecedor";
      const value = m.quantity * (m.product.cost ?? m.product.price);
      supplierMap.set(supplier, (supplierMap.get(supplier) ?? 0) + value);
    }

    const chartFornecedor = [...supplierMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value], i) => ({
        name,
        value,
        color: donutPalette[i % donutPalette.length],
      }));

    const entradasMes = monthMovements.reduce((s, m) => s + m.quantity, 0);
    const valorEntradasMes = monthMovements.reduce(
      (s, m) => s + m.quantity * (m.product.cost ?? m.product.price),
      0,
    );

    const ajustesMes = await prisma.stockMovement.count({
      where: {
        productId: { in: productIds },
        type: "ADJUSTMENT",
        createdAt: { gte: startOfMonth },
      },
    });

    const ajustesNegativosMes = await prisma.stockMovement.count({
      where: {
        productId: { in: productIds },
        type: "ADJUSTMENT",
        quantity: { lt: 0 },
        createdAt: { gte: startOfMonth },
      },
    });

    return NextResponse.json({
      kpis: {
        valorEmEstoque,
        itensEmEstoque,
        estoqueBaixo,
        movimentacoesMes,
        entradasMes,
        valorEntradasMes,
        ajustesMes,
        ajustesNegativosMes,
      },
      chartCategoria,
      chartFornecedor,
      lowStockChart: lowStock.map((p) => ({
        label: p.name.length > 20 ? `${p.name.slice(0, 18)}…` : p.name,
        valor: p.deficitPct,
      })),
    });
  });
}
