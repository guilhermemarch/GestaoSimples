import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";
import type { StockMovementType } from "@prisma/client";

type MovementItem = {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string | null;
  type: string;
  quantity: number;
  balanceAfter: number;
  description: string | null;
  createdAt: string;
};

function parseDateRange(from: string | null, to: string | null) {
  if (!from && !to) return undefined;
  return {
    ...(from ? { gte: new Date(from) } : {}),
    ...(to ? { lte: new Date(to) } : {}),
  };
}

export async function GET(request: Request) {
  return withAuth(async (user) => {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as StockMovementType | "SALE" | null;
    const productId = searchParams.get("productId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const search = searchParams.get("search")?.toLowerCase().trim();
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));

    const products = await prisma.product.findMany({
      where: {
        companyId: user.companyId,
        ...(productId ? { id: productId } : {}),
      },
      select: { id: true, name: true, imageUrl: true, stock: true },
    });

    const productIds = products.map((p) => p.id);
    const productMap = new Map(products.map((p) => [p.id, p]));
    const dateFilter = parseDateRange(from, to);

    const stockMovements =
      type === "SALE"
        ? []
        : await prisma.stockMovement.findMany({
            where: {
              productId: { in: productIds },
              ...(type ? { type } : {}),
              ...(dateFilter ? { createdAt: dateFilter } : {}),
            },
            orderBy: { createdAt: "desc" },
          });

    const saleItems =
      !type || type === "SALE"
        ? await prisma.saleItem.findMany({
            where: {
              productId: { in: productIds },
              sale: {
                companyId: user.companyId,
                status: "CONFIRMED",
                ...(dateFilter ? { createdAt: dateFilter } : {}),
              },
            },
            include: {
              sale: {
                select: {
                  id: true,
                  createdAt: true,
                  customer: { select: { name: true } },
                },
              },
            },
            orderBy: { sale: { createdAt: "desc" } },
          })
        : [];

    const fromStock: MovementItem[] = stockMovements.map((m) => {
      const product = productMap.get(m.productId);
      return {
        id: m.id,
        productId: m.productId,
        productName: product?.name ?? "—",
        productImageUrl: product?.imageUrl ?? null,
        type: m.type,
        quantity: m.quantity,
        balanceAfter: m.balanceAfter,
        description: m.description,
        createdAt: m.createdAt.toISOString(),
      };
    });

    const fromSales: MovementItem[] = saleItems.map((item) => {
      const product = productMap.get(item.productId);
      return {
        id: `sale-${item.id}`,
        productId: item.productId,
        productName: product?.name ?? "—",
        productImageUrl: product?.imageUrl ?? null,
        type: "SALE",
        quantity: -item.quantity,
        balanceAfter: product?.stock ?? 0,
        description: `Venda — ${item.sale.customer.name}`,
        createdAt: item.sale.createdAt.toISOString(),
      };
    });

    let items = [...fromStock, ...fromSales].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    if (search) {
      items = items.filter(
        (m) =>
          m.productName.toLowerCase().includes(search) ||
          m.description?.toLowerCase().includes(search),
      );
    }

    const total = items.length;
    const start = (page - 1) * limit;
    const paginated = items.slice(start, start + limit);

    const summary = {
      entradas: items.filter((m) => m.quantity > 0).reduce((s, m) => s + m.quantity, 0),
      saidas: Math.abs(items.filter((m) => m.quantity < 0).reduce((s, m) => s + m.quantity, 0)),
      ajustes: items.filter((m) => m.type === "ADJUSTMENT").length,
    };

    return NextResponse.json({ items: paginated, total, page, pageSize: limit, summary });
  });
}

export async function POST(request: Request) {
  return withAuth(async (user) => {
    const body = await request.json();
    const productId = body.productId as string;
    const type = body.type as "PURCHASE" | "ADJUSTMENT";
    const quantity = Number(body.quantity);
    const description = body.description?.trim() || null;

    if (!productId || !type || !quantity || Number.isNaN(quantity)) {
      return NextResponse.json(
        { error: "Produto, tipo e quantidade são obrigatórios" },
        { status: 400 },
      );
    }

    if (type !== "PURCHASE" && type !== "ADJUSTMENT") {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }

    if (type === "PURCHASE" && quantity <= 0) {
      return NextResponse.json({ error: "Quantidade de compra deve ser positiva" }, { status: 400 });
    }

    if (type === "ADJUSTMENT" && quantity === 0) {
      return NextResponse.json({ error: "Quantidade de ajuste não pode ser zero" }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, companyId: user.companyId },
    });
    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const newStock = product.stock + quantity;
    if (newStock < 0) {
      return NextResponse.json({ error: "Estoque não pode ficar negativo" }, { status: 400 });
    }

    const movement = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: { stock: newStock },
      });
      return tx.stockMovement.create({
        data: {
          productId,
          type,
          quantity,
          balanceAfter: newStock,
          description:
            description ??
            (type === "PURCHASE" ? "Compra registrada" : "Ajuste de inventário"),
        },
        include: { product: { select: { name: true, imageUrl: true } } },
      });
    });

    return NextResponse.json(
      {
        id: movement.id,
        productId: movement.productId,
        productName: movement.product.name,
        productImageUrl: movement.product.imageUrl,
        type: movement.type,
        quantity: movement.quantity,
        balanceAfter: movement.balanceAfter,
        description: movement.description,
        createdAt: movement.createdAt.toISOString(),
      },
      { status: 201 },
    );
  });
}
