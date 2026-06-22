import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";
import type { CashMovementType } from "@prisma/client";

export async function GET() {
  return withAuth(async (user) => {
    const session = await prisma.cashSession.findFirst({
      where: { companyId: user.companyId, status: "OPEN" },
    });

    if (!session) {
      return NextResponse.json({ error: "Nenhum caixa aberto" }, { status: 400 });
    }

    const movements = await prisma.cashMovement.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(movements);
  });
}

export async function POST(request: Request) {
  return withAuth(async (user) => {
    const body = await request.json();
    const type = body.type as CashMovementType;
    const amount = Number(body.amount);
    const description = body.description?.trim() || null;

    if (!["REINFORCEMENT", "WITHDRAWAL", "EXPENSE"].includes(type)) {
      return NextResponse.json({ error: "Tipo de movimento inválido" }, { status: 400 });
    }
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valor deve ser maior que zero" }, { status: 400 });
    }

    const session = await prisma.cashSession.findFirst({
      where: { companyId: user.companyId, status: "OPEN" },
    });
    if (!session) {
      return NextResponse.json({ error: "Nenhum caixa aberto" }, { status: 400 });
    }

    const signedAmount = type === "WITHDRAWAL" || type === "EXPENSE" ? -amount : amount;

    const movement = await prisma.cashMovement.create({
      data: {
        sessionId: session.id,
        type,
        amount: signedAmount,
        description,
      },
    });

    return NextResponse.json(movement, { status: 201 });
  });
}
