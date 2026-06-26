import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withFinancialAccess } from "@/lib/api";
import type { ExpenseCategory, ExpenseStatus } from "@prisma/client";

export async function GET(request: Request) {
  return withFinancialAccess(async (user) => {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as ExpenseStatus | null;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const expenses = await prisma.expense.findMany({
      where: {
        companyId: user.companyId,
        ...(status ? { status } : {}),
        ...(from || to
          ? {
              date: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(expenses);
  });
}

export async function POST(request: Request) {
  return withFinancialAccess(async (user) => {
    const body = await request.json();
    const description = body.description?.trim();
    const amount = Number(body.amount);
    const date = body.date ? new Date(body.date) : new Date();
    const category = (body.category as ExpenseCategory) || "OTHER";

    if (!description || !amount) {
      return NextResponse.json({ error: "Descrição e valor são obrigatórios" }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        companyId: user.companyId,
        description,
        amount,
        date,
        category,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        paymentMethod: body.paymentMethod || null,
        status: body.status === "PAID" ? "PAID" : "PENDING",
        supplier: body.supplier?.trim() || null,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  });
}
