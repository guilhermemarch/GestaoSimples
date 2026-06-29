import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";
import { cancelSale, createSale } from "@/lib/sales";
import type { PaymentMethod } from "@prisma/client";

type SaleItemInput = { productId: string; quantity: number };

export async function GET(request: Request) {
  return withAuth(async (user) => {
    const { searchParams } = new URL(request.url);
    const paymentMethod = searchParams.get("paymentMethod") as PaymentMethod | null;

    const sales = await prisma.sale.findMany({
      where: {
        companyId: user.companyId,
        ...(paymentMethod ? { paymentMethod } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true } },
        items: { include: { product: { select: { id: true, name: true } } } },
        payments: true,
      },
    });

    return NextResponse.json(sales);
  });
}

export async function POST(request: Request) {
  return withAuth(async (user) => {
    const body = await request.json();
    const customerId = body.customerId as string;
    const items = body.items as SaleItemInput[];

    if (!customerId) {
      return NextResponse.json({ error: "Cliente é obrigatório" }, { status: 400 });
    }
    if (!items?.length) {
      return NextResponse.json({ error: "Adicione pelo menos um produto" }, { status: 400 });
    }

    try {
      const sale = await createSale(user.companyId, customerId, items, {
        paymentMethod: body.paymentMethod,
        payments: body.payments,
        amountReceived: body.amountReceived != null ? Number(body.amountReceived) : undefined,
        dueDate: body.dueDate,
        discount: body.discount != null ? Number(body.discount) : undefined,
        notes: body.notes,
        status: body.status === "QUOTE" ? "QUOTE" : "CONFIRMED",
      });
      return NextResponse.json(sale, { status: 201 });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao registrar venda";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  });
}
