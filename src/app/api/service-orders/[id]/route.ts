import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";
import { updateServiceOrder } from "@/lib/service-orders";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  return withAuth(async (user) => {
    const { id } = await params;
    const order = await prisma.serviceOrder.findFirst({
      where: { id, companyId: user.companyId },
      include: {
        customer: true,
        items: { include: { product: true } },
        sale: true,
        history: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Ordem não encontrada" }, { status: 404 });
    }

    return NextResponse.json(order);
  });
}

export async function PUT(request: Request, { params }: Params) {
  return withAuth(async (user) => {
    const { id } = await params;
    const body = await request.json();

    try {
      const order = await updateServiceOrder(user.companyId, id, {
        description: body.description,
        laborCost: body.laborCost != null ? Number(body.laborCost) : undefined,
        estimatedDate: body.estimatedDate,
        notes: body.notes,
        items: body.items,
      });
      return NextResponse.json(order);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar ordem";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  });
}
