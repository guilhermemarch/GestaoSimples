import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  return withAuth(async (user) => {
    const { id } = await params;
    const product = await prisma.product.findFirst({
      where: { id, companyId: user.companyId },
      include: { _count: { select: { saleItems: true } } },
    });

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    return NextResponse.json(product);
  });
}

export async function PUT(request: Request, { params }: Params) {
  return withAuth(async (user) => {
    const { id } = await params;
    const body = await request.json();
    const name = body.name?.trim();
    const price = Number(body.price);
    const stock = Number(body.stock);

    if (!name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }
    if (!price || price <= 0) {
      return NextResponse.json({ error: "Preço deve ser maior que zero" }, { status: 400 });
    }
    if (stock < 0 || Number.isNaN(stock)) {
      return NextResponse.json({ error: "Estoque inválido" }, { status: 400 });
    }

    const existing = await prisma.product.findFirst({ where: { id, companyId: user.companyId } });
    if (!existing) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        sku: body.sku?.trim() || null,
        price,
        cost: body.cost != null ? Number(body.cost) : null,
        stock,
        minStock: body.minStock != null ? Number(body.minStock) : existing.minStock,
        active: body.active !== false,
      },
    });

    return NextResponse.json(product);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withAuth(async (user) => {
    const { id } = await params;

    const product = await prisma.product.findFirst({ where: { id, companyId: user.companyId } });
    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const itemsCount = await prisma.saleItem.count({ where: { productId: id } });
    if (itemsCount > 0) {
      await prisma.product.update({ where: { id }, data: { active: false } });
      return NextResponse.json({ ok: true, inactivated: true });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  });
}
