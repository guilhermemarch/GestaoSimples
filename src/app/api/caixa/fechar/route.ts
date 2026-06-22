import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";

export async function POST(request: Request) {
  return withAuth(async (user) => {
    const body = await request.json();
    const closingAmount = Number(body.closingAmount);
    const justification = body.justification?.trim() || null;

    if (Number.isNaN(closingAmount)) {
      return NextResponse.json({ error: "Valor de fechamento é obrigatório" }, { status: 400 });
    }

    const session = await prisma.cashSession.findFirst({
      where: { companyId: user.companyId, status: "OPEN" },
      include: { movements: true, sales: true },
    });

    if (!session) {
      return NextResponse.json({ error: "Nenhum caixa aberto" }, { status: 400 });
    }

    const cashSales = session.movements
      .filter((m) => m.type === "SALE")
      .reduce((sum, m) => sum + m.amount, 0);
    const reinforcements = session.movements
      .filter((m) => m.type === "REINFORCEMENT")
      .reduce((sum, m) => sum + m.amount, 0);
    const withdrawals = session.movements
      .filter((m) => m.type === "WITHDRAWAL")
      .reduce((sum, m) => sum + m.amount, 0);
    const expenses = session.movements
      .filter((m) => m.type === "EXPENSE")
      .reduce((sum, m) => sum + m.amount, 0);

    const expectedAmount =
      session.openingAmount + cashSales + reinforcements + withdrawals - expenses;
    const difference = closingAmount - expectedAmount;

    if (difference !== 0 && !justification) {
      return NextResponse.json(
        { error: "Justificativa obrigatória quando há diferença no fechamento" },
        { status: 400 },
      );
    }

    const closed = await prisma.cashSession.update({
      where: { id: session.id },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
        closingAmount,
        expectedAmount,
        difference,
        justification,
      },
      include: { movements: true },
    });

    return NextResponse.json(closed);
  });
}
