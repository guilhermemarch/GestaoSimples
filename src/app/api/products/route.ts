import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";

export async function GET(request: Request) {
  return withAuth(async (user) => {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const lowStock = searchParams.get("lowStock") === "true";

    const products = await prisma.product.findMany({
      where: {
        companyId: user.companyId,
        ...(q ? { name: { contains: q } } : {}),
      },
      orderBy: { name: "asc" },
      include: { _count: { select: { saleItems: true } } },
    });

    const result = lowStock
      ? products.filter((p) => p.stock <= p.minStock)
      : products;

    return NextResponse.json(result);
  });
}

export async function POST(request: Request) {
  return withAuth(async (user) => {
    const body = await request.json();
    const name = body.name?.trim();
    const price = Number(body.price);
    const stock = Number(body.stock);
    const minStock = body.minStock != null ? Number(body.minStock) : 5;

    if (!name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }
    if (!price || price <= 0) {
      return NextResponse.json({ error: "Preço deve ser maior que zero" }, { status: 400 });
    }
    if (stock < 0 || Number.isNaN(stock)) {
      return NextResponse.json({ error: "Estoque inválido" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        companyId: user.companyId,
        name,
        sku: body.sku?.trim() || null,
        price,
        cost: body.cost != null ? Number(body.cost) : null,
        stock,
        minStock: minStock >= 0 ? minStock : 5,
        category: body.category?.trim() || null,
        imageUrl: body.imageUrl?.trim() || null,
        active: body.active !== false,
      },
    });

    return NextResponse.json(product, { status: 201 });
  });
}
