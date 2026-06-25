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

export async function GET(_request: Request, { params }: Params) {
  return withFinancialAccess(async (user) => {
    const { id } = await params;
    const receivable = await prisma.receivable.findFirst({
      where: { id, companyId: user.companyId },
      include: { customer: true, payments: true, sale: true },
    });

    if (!receivable) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
    }

    return NextResponse.json(receivable);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withFinancialAccess(async (user) => {
    const { id } = await params;
    const receivable = await prisma.receivable.findFirst({
      where: { id, companyId: user.companyId },
    });
    if (!receivable) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
    }
    if (receivable.saleId) {
      return NextResponse.json(
        { error: "Conta vinculada a venda não pode ser excluída" },
        { status: 400 },
      );
    }
    await prisma.receivable.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  });
}
