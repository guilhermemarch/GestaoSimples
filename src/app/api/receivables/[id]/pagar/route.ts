import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withFinancialAccess } from "@/lib/api";
import type { ReceivableStatus } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

function resolveStatus(amount: number, paidAmount: number, dueDate: Date): ReceivableStatus {
  if (paidAmount >= amount) return "PAID";
  if (paidAmount > 0) return "PARTIAL";
  if (dueDate < new Date()) return "OVERDUE";
  return "OPEN";
}

export async function POST(request: Request, { params }: Params) {
  return withFinancialAccess(async (user) => {
    const { id } = await params;
    const body = await request.json();
    const amount = Number(body.amount);

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valor do pagamento é obrigatório" }, { status: 400 });
    }

    const receivable = await prisma.receivable.findFirst({
      where: { id, companyId: user.companyId },
    });
    if (!receivable) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
    }

    const newPaid = receivable.paidAmount + amount;
    if (newPaid > receivable.amount) {
      return NextResponse.json({ error: "Pagamento excede o valor da conta" }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.receivablePayment.create({
        data: { receivableId: id, amount },
      });
      return tx.receivable.update({
        where: { id },
        data: {
          paidAmount: newPaid,
          status: resolveStatus(receivable.amount, newPaid, receivable.dueDate),
        },
        include: { customer: true, payments: true },
      });
    });

    return NextResponse.json(updated);
  });
}
