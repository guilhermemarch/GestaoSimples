import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  const products = await prisma.product.findMany({
    where: q ? { name: { contains: q } } : undefined,
    orderBy: { name: "asc" },
    include: { _count: { select: { saleItems: true } } },
  });

  return NextResponse.json(products);
}

export async function POST(request: Request) {
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

  const product = await prisma.product.create({
    data: { name, price, stock },
  });

  return NextResponse.json(product, { status: 201 });
}
