import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withFinancialAccess } from "@/lib/api";

type Params = { params: Promise<{ tipo: string }> };

function parseDateRange(url: string) {
  const { searchParams } = new URL(url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    from: from ? new Date(from) : startOfMonth,
    to: to ? new Date(to) : now,
    format: searchParams.get("format"),
  };
}

export async function GET(request: Request, { params }: Params) {
  return withFinancialAccess(async (user) => {
    const { tipo } = await params;
    const { from, to, format } = parseDateRange(request.url);

    let data: unknown;

    switch (tipo) {
      case "vendas": {
        const sales = await prisma.sale.findMany({
          where: {
            companyId: user.companyId,
            status: "CONFIRMED",
            createdAt: { gte: from, lte: to },
          },
          include: { customer: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        });
        data = {
          period: { from, to },
          total: sales.reduce((s, sale) => s + sale.total, 0),
          count: sales.length,
          sales,
        };
        break;
      }
      case "vendas-por-pagamento": {
        const groups = await prisma.sale.groupBy({
          by: ["paymentMethod"],
          where: {
            companyId: user.companyId,
            status: "CONFIRMED",
            createdAt: { gte: from, lte: to },
          },
          _sum: { total: true },
          _count: true,
        });
        data = { period: { from, to }, groups };
        break;
      }
      case "produtos-mais-vendidos": {
        const items = await prisma.saleItem.groupBy({
          by: ["productId"],
          where: {
            sale: {
              companyId: user.companyId,
              status: "CONFIRMED",
              createdAt: { gte: from, lte: to },
            },
          },
          _sum: { quantity: true, subtotal: true },
          orderBy: { _sum: { quantity: "desc" } },
          take: 20,
        });
        const products = await prisma.product.findMany({
          where: { id: { in: items.map((i) => i.productId) } },
          select: { id: true, name: true, imageUrl: true },
        });
        const map = Object.fromEntries(products.map((p) => [p.id, p]));
        data = {
          period: { from, to },
          items: items.map((i) => ({
            productId: i.productId,
            name: map[i.productId]?.name ?? "—",
            imageUrl: map[i.productId]?.imageUrl ?? null,
            quantity: i._sum.quantity ?? 0,
            revenue: i._sum.subtotal ?? 0,
          })),
        };
        break;
      }
      case "estoque-baixo": {
        const products = await prisma.product.findMany({
          where: { companyId: user.companyId, active: true },
        });
        data = products.filter((p) => p.stock <= p.minStock);
        break;
      }
      case "contas-atraso": {
        data = await prisma.receivable.findMany({
          where: { companyId: user.companyId, status: "OVERDUE" },
          include: { customer: { select: { name: true } } },
        });
        break;
      }
      case "despesas-categoria": {
        const groups = await prisma.expense.groupBy({
          by: ["category"],
          where: { companyId: user.companyId, date: { gte: from, lte: to } },
          _sum: { amount: true },
        });
        data = { period: { from, to }, groups };
        break;
      }
      case "resultado-mensal": {
        const [salesSum, expensesSum] = await Promise.all([
          prisma.sale.aggregate({
            where: {
              companyId: user.companyId,
              status: "CONFIRMED",
              createdAt: { gte: from, lte: to },
            },
            _sum: { total: true },
          }),
          prisma.expense.aggregate({
            where: { companyId: user.companyId, date: { gte: from, lte: to } },
            _sum: { amount: true },
          }),
        ]);
        const revenue = salesSum._sum.total ?? 0;
        const expenses = expensesSum._sum.amount ?? 0;
        data = {
          period: { from, to },
          revenue,
          expenses,
          estimatedResult: revenue - expenses,
        };
        break;
      }
      case "servicos": {
        const orders = await prisma.serviceOrder.findMany({
          where: {
            companyId: user.companyId,
            createdAt: { gte: from, lte: to },
          },
          include: { customer: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        });
        const byStatus = await prisma.serviceOrder.groupBy({
          by: ["status"],
          where: { companyId: user.companyId, createdAt: { gte: from, lte: to } },
          _count: true,
        });
        data = { period: { from, to }, orders, byStatus };
        break;
      }
      default:
        return NextResponse.json({ error: "Tipo de relatório inválido" }, { status: 404 });
    }

    if (format === "csv" && Array.isArray(data)) {
      const rows = data as Record<string, unknown>[];
      if (rows.length === 0) {
        return new NextResponse("", { headers: { "Content-Type": "text/csv" } });
      }
      const headers = Object.keys(rows[0]);
      const csv = [
        headers.join(","),
        ...rows.map((row) => headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")),
      ].join("\n");
      return new NextResponse(csv, {
        headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="${tipo}.csv"` },
      });
    }

    return NextResponse.json(data);
  });
}
