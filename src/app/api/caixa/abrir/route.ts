import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";

export async function POST(request: Request) {
  return withAuth(async (user) => {
    const body = await request.json();
    const openingAmount = Number(body.openingAmount ?? 0);

    const existing = await prisma.cashSession.findFirst({
      where: { companyId: user.companyId, status: "OPEN" },
    });
    if (existing) {
      return NextResponse.json({ error: "Já existe um caixa aberto" }, { status: 400 });
    }

    const session = await prisma.cashSession.create({
      data: {
        companyId: user.companyId,
        openedById: user.id,
        openingAmount,
        status: "OPEN",
      },
      include: { openedBy: { select: { id: true, name: true } } },
    });

    return NextResponse.json(session, { status: 201 });
  });
}
