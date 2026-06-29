import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAuth(async (user) => {
    const { id } = await params;
    const product = await prisma.product.findFirst({
      where: { id, companyId: user.companyId },
    });
    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const [stockMovements, saleItems] = await Promise.all([
      prisma.stockMovement.findMany({
        where: { productId: id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.saleItem.findMany({
        where: {
          productId: id,
          sale: { companyId: user.companyId, status: "CONFIRMED" },
        },
        include: {
          sale: { select: { id: true, createdAt: true, customer: { select: { name: true } } } },
        },
        orderBy: { sale: { createdAt: "desc" } },
        take: 50,
      }),
    ]);

    const fromSales = saleItems.map((item) => ({
      id: `sale-${item.id}`,
      type: "SALE" as const,
      quantity: -item.quantity,
      balanceAfter: product.stock,
      description: `Venda — ${item.sale.customer.name}`,
      createdAt: item.sale.createdAt.toISOString(),
    }));

    const fromStock = stockMovements.map((m) => ({
      id: m.id,
      type: m.type,
      quantity: m.quantity,
      balanceAfter: m.balanceAfter,
      description: m.description,
      createdAt: m.createdAt.toISOString(),
    }));

    const movements = [...fromStock, ...fromSales]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50);

    return NextResponse.json(movements);
  });
}
