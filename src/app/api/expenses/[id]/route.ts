import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withFinancialAccess } from "@/lib/api";
import type { ExpenseCategory, ExpenseStatus } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  return withFinancialAccess(async (user) => {
    const { id } = await params;
    const expense = await prisma.expense.findFirst({
      where: { id, companyId: user.companyId },
    });
    if (!expense) {
      return NextResponse.json({ error: "Despesa não encontrada" }, { status: 404 });
    }
    return NextResponse.json(expense);
  });
}

export async function PUT(request: Request, { params }: Params) {
  return withFinancialAccess(async (user) => {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.expense.findFirst({
      where: { id, companyId: user.companyId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Despesa não encontrada" }, { status: 404 });
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        description: body.description?.trim() ?? existing.description,
        amount: body.amount != null ? Number(body.amount) : existing.amount,
        date: body.date ? new Date(body.date) : existing.date,
        category: (body.category as ExpenseCategory) ?? existing.category,
        dueDate: body.dueDate ? new Date(body.dueDate) : existing.dueDate,
        paymentMethod: body.paymentMethod ?? existing.paymentMethod,
        status: (body.status as ExpenseStatus) ?? existing.status,
        supplier: body.supplier?.trim() ?? existing.supplier,
      },
    });

    return NextResponse.json(expense);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withFinancialAccess(async (user) => {
    const { id } = await params;
    const existing = await prisma.expense.findFirst({
      where: { id, companyId: user.companyId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Despesa não encontrada" }, { status: 404 });
    }
    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  });
}
