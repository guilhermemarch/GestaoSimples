import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withFinancialAccess } from "@/lib/api";
import type { ReceivableStatus } from "@prisma/client";

function resolveStatus(amount: number, paidAmount: number, dueDate: Date): ReceivableStatus {
  if (paidAmount >= amount) return "PAID";
  if (paidAmount > 0) return "PARTIAL";
  if (dueDate < new Date()) return "OVERDUE";
  return "OPEN";
}

export async function GET(request: Request) {
  return withFinancialAccess(async (user) => {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as ReceivableStatus | null;

    const receivables = await prisma.receivable.findMany({
      where: {
        companyId: user.companyId,
        ...(status ? { status } : {}),
      },
      orderBy: { dueDate: "asc" },
      include: {
        customer: { select: { id: true, name: true } },
        payments: true,
      },
    });

    return NextResponse.json(receivables);
  });
}

export async function POST(request: Request) {
  return withFinancialAccess(async (user) => {
    const body = await request.json();
    const customerId = body.customerId as string;
    const description = body.description?.trim();
    const amount = Number(body.amount);
    const dueDate = body.dueDate ? new Date(body.dueDate) : null;

    if (!customerId || !description || !amount || !dueDate) {
      return NextResponse.json(
        { error: "Cliente, descrição, valor e vencimento são obrigatórios" },
        { status: 400 },
      );
    }

    const customer = await prisma.customer.findFirst({
      where: { id: customerId, companyId: user.companyId },
    });
    if (!customer) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const receivable = await prisma.receivable.create({
      data: {
        companyId: user.companyId,
        customerId,
        description,
        amount,
        dueDate,
        status: resolveStatus(amount, 0, dueDate),
      },
      include: { customer: true },
    });

    return NextResponse.json(receivable, { status: 201 });
  });
}
