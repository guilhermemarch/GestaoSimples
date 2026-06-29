import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, withRoles } from "@/lib/api";
import { cancelSale } from "@/lib/sales";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  return withAuth(async (user) => {
    const { id } = await params;

    const sale = await prisma.sale.findFirst({
      where: { id, companyId: user.companyId },
      include: {
        customer: true,
        items: { include: { product: true } },
        payments: true,
      },
    });

    if (!sale) {
      return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 });
    }

    return NextResponse.json(sale);
  });
}

export async function POST(request: Request, { params }: Params) {
  return withRoles(["ADMIN", "MANAGER"], async (user) => {
    const { id } = await params;
    const body = await request.json();
    const reason = body.reason?.trim();

    if (!reason) {
      return NextResponse.json({ error: "Motivo do cancelamento é obrigatório" }, { status: 400 });
    }

    try {
      const sale = await cancelSale(id, user.companyId, user.id, reason);
      return NextResponse.json(sale);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao cancelar venda";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  });
}
