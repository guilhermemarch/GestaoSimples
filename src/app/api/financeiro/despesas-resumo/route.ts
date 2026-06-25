import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withFinancialAccess } from "@/lib/api";
import { donutPalette } from "@/components/charts/chart-tokens";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/labels";

function pctChange(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? "+100%" : "0%";
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1).replace(".", ",")}%`;
}

export async function GET() {
  return withFinancialAccess(async (user) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const startOf30Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    const in7Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 23, 59, 59);

    const expenses = await prisma.expense.findMany({
      where: { companyId: user.companyId },
      orderBy: { date: "desc" },
    });

    const pending = expenses.filter((e) => e.status === "PENDING");
    const totalPendente = pending.reduce((s, e) => s + e.amount, 0);

    const paidMonth = expenses.filter(
      (e) => e.status === "PAID" && e.date >= startOfMonth,
    );
    const pagasMes = paidMonth.reduce((s, e) => s + e.amount, 0);

    const paidPrevMonth = expenses.filter(
      (e) => e.status === "PAID" && e.date >= startOfPrevMonth && e.date <= endOfPrevMonth,
    );
    const pagasMesPrev = paidPrevMonth.reduce((s, e) => s + e.amount, 0);

    const vencendo7 = pending.filter((e) => {
      const due = e.dueDate ?? e.date;
      return due <= in7Days;
    });

    const categoryMonth = new Map<string, number>();
    for (const e of paidMonth) {
      categoryMonth.set(e.category, (categoryMonth.get(e.category) ?? 0) + e.amount);
    }
    const topCategory = [...categoryMonth.entries()].sort((a, b) => b[1] - a[1])[0];

    const chart30: { label: string; despesas: number }[] = [];
    const paid30 = expenses.filter((e) => e.date >= startOf30Days);
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
      const despesas = paid30
        .filter((e) => e.status === "PAID" && e.date >= dayStart && e.date <= dayEnd)
        .reduce((s, e) => s + e.amount, 0);
      chart30.push({ label, despesas });
    }

    const donut = [...categoryMonth.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([cat, value], i) => ({
        name: EXPENSE_CATEGORY_LABELS[cat] ?? cat,
        value,
        color: donutPalette[i % donutPalette.length],
      }));

    return NextResponse.json({
      kpis: {
        totalPendente: { value: totalPendente, count: pending.length },
        pagasMes: { value: pagasMes, trend: pctChange(pagasMes, pagasMesPrev) },
        vencendo7: { value: vencendo7.reduce((s, e) => s + e.amount, 0), count: vencendo7.length },
        maiorCategoria: {
          name: topCategory ? (EXPENSE_CATEGORY_LABELS[topCategory[0]] ?? topCategory[0]) : "—",
          value: topCategory?.[1] ?? 0,
        },
      },
      chart30,
      donut,
      items: expenses.map((e) => ({
        id: e.id,
        description: e.description,
        category: e.category,
        amount: e.amount,
        date: e.date.toISOString(),
        dueDate: e.dueDate?.toISOString() ?? null,
        status: e.status,
        supplier: e.supplier,
      })),
    });
  });
}
