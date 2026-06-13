import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { _count: { select: { sales: true } } },
  });

  if (!customer) {
    return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
  }

  return NextResponse.json(customer);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      name,
      phone: body.phone?.trim() || null,
      email: body.email?.trim() || null,
    },
  });

  return NextResponse.json(customer);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  const salesCount = await prisma.sale.count({ where: { customerId: id } });
  if (salesCount > 0) {
    return NextResponse.json(
      { error: "Cliente possui vendas vinculadas e não pode ser excluído" },
      { status: 400 },
    );
  }

  await prisma.customer.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
