import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";
import { createServiceOrder } from "@/lib/service-orders";
import type { ServiceOrderStatus } from "@prisma/client";

export async function GET(request: Request) {
  return withAuth(async (user) => {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as ServiceOrderStatus | null;
    const customerId = searchParams.get("customerId");
    const q = searchParams.get("q")?.trim();

    const orders = await prisma.serviceOrder.findMany({
      where: {
        companyId: user.companyId,
        ...(status ? { status } : {}),
        ...(customerId ? { customerId } : {}),
        ...(q
          ? {
              OR: [
                { description: { contains: q } },
                { customer: { name: { contains: q } } },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: "desc" },
      include: {
        customer: { select: { id: true, name: true } },
        items: { include: { product: { select: { id: true, name: true } } } },
        _count: { select: { history: true } },
      },
    });

    return NextResponse.json(orders);
  });
}

export async function POST(request: Request) {
  return withAuth(async (user) => {
    const body = await request.json();
    if (!body.customerId || !body.description?.trim()) {
      return NextResponse.json(
        { error: "Cliente e descrição são obrigatórios" },
        { status: 400 },
      );
    }

    try {
      const order = await createServiceOrder(user.companyId, user.id, {
        customerId: body.customerId,
        description: body.description.trim(),
        laborCost: body.laborCost != null ? Number(body.laborCost) : undefined,
        estimatedDate: body.estimatedDate,
        notes: body.notes,
        items: body.items,
      });
      return NextResponse.json(order, { status: 201 });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao criar ordem";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  });
}
