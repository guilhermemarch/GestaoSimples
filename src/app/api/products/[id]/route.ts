import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { _count: { select: { saleItems: true } } },
  });

  if (!product) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(request: Request, { params }: Params) {
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

  const product = await prisma.product.update({
    where: { id },
    data: { name, price, stock },
  });

  return NextResponse.json(product);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  const itemsCount = await prisma.saleItem.count({ where: { productId: id } });
  if (itemsCount > 0) {
    return NextResponse.json(
      { error: "Produto possui vendas vinculadas e não pode ser excluído" },
      { status: 400 },
    );
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
