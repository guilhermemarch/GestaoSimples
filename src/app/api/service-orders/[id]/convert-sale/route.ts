import { NextResponse } from "next/server";
import { withRoles } from "@/lib/api";
import { convertServiceOrderToSale } from "@/lib/service-orders";
import type { PaymentMethod } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  return withRoles(["ADMIN", "MANAGER"], async (user) => {
    const { id } = await params;
    const body = await request.json();

    try {
      const order = await convertServiceOrderToSale(user.companyId, id, user.id, {
        paymentMethod: body.paymentMethod as PaymentMethod,
        amountReceived: body.amountReceived != null ? Number(body.amountReceived) : undefined,
      });
      return NextResponse.json(order);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao converter em venda";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  });
}
