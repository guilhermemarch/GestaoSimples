import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/labels";

const COLORS = ["#1F8A5B", "#2563EB", "#8B5CF6", "#F59E0B", "#EF4444", "#64748B"];

export async function GET(request: Request) {
  return withAuth(async (user) => {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const fromDate = from ? new Date(from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const toDate = to ? new Date(`${to}T23:59:59`) : new Date();

    const expenses = await prisma.expense.findMany({
      where: {
        companyId: user.companyId,
        date: { gte: fromDate, lte: toDate },
      },
    });

    const byCategory = new Map<string, number>();
    for (const e of expenses) {
      const label = EXPENSE_CATEGORY_LABELS[e.category] ?? e.category;
      byCategory.set(label, (byCategory.get(label) ?? 0) + e.amount);
    }

    const items = Array.from(byCategory.entries())
      .map(([name, value], i) => ({
        name,
        value,
        color: COLORS[i % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    const total = items.reduce((s, i) => s + i.value, 0);

    return NextResponse.json({ items, total });
  });
}
