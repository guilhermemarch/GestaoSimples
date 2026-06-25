import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";

function pctChange(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? "+100%" : "0%";
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1).replace(".", ",")}%`;
}

export async function GET() {
  return withAuth(async (user) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const startOf30Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);

    const baseSale = { companyId: user.companyId, status: "CONFIRMED" as const };

    const [
      salesMonth,
      salesPrevMonth,
      receivedMonth,
      receivedPrevMonth,
      pendingAgg,
      pendingPrevAgg,
      expensesPaidMonth,
      expensesPaidPrevMonth,
      receivables,
      expenses,
      sales30,
      payments30,
      expenses30,
    ] = await Promise.all([
      prisma.sale.aggregate({
        where: { ...baseSale, createdAt: { gte: startOfMonth } },
        _sum: { total: true },
      }),
      prisma.sale.aggregate({
        where: { ...baseSale, createdAt: { gte: startOfPrevMonth, lte: endOfPrevMonth } },
        _sum: { total: true },
      }),
      prisma.receivablePayment.aggregate({
        where: {
          receivable: { companyId: user.companyId },
          paidAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.receivablePayment.aggregate({
        where: {
          receivable: { companyId: user.companyId },
          paidAt: { gte: startOfPrevMonth, lte: endOfPrevMonth },
        },
        _sum: { amount: true },
      }),
      prisma.receivable.aggregate({
        where: {
          companyId: user.companyId,
          status: { in: ["OPEN", "PARTIAL", "OVERDUE"] },
        },
        _sum: { amount: true, paidAmount: true },
      }),
      prisma.receivable.aggregate({
        where: {
          companyId: user.companyId,
          status: { in: ["OPEN", "PARTIAL", "OVERDUE"] },
          createdAt: { lte: endOfPrevMonth },
        },
        _sum: { amount: true, paidAmount: true },
      }),
      prisma.expense.aggregate({
        where: {
          companyId: user.companyId,
          status: "PAID",
          date: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: {
          companyId: user.companyId,
          status: "PAID",
          date: { gte: startOfPrevMonth, lte: endOfPrevMonth },
        },
        _sum: { amount: true },
      }),
      prisma.receivable.findMany({
        where: { companyId: user.companyId },
        include: { customer: { select: { name: true } } },
        orderBy: { dueDate: "asc" },
        take: 8,
      }),
      prisma.expense.findMany({
        where: { companyId: user.companyId },
        orderBy: { dueDate: "asc" },
        take: 8,
      }),
      prisma.sale.findMany({
        where: { ...baseSale, createdAt: { gte: startOf30Days } },
        select: { createdAt: true, total: true },
      }),
      prisma.receivablePayment.findMany({
        where: {
          receivable: { companyId: user.companyId },
          paidAt: { gte: startOf30Days },
        },
        select: { paidAt: true, amount: true },
      }),
      prisma.expense.findMany({
        where: {
          companyId: user.companyId,
          date: { gte: startOf30Days },
        },
        select: { date: true, amount: true },
      }),
    ]);

    const totalVendido = salesMonth._sum.total ?? 0;
    const totalVendidoPrev = salesPrevMonth._sum.total ?? 0;
    const totalRecebido = receivedMonth._sum.amount ?? 0;
    const totalRecebidoPrev = receivedPrevMonth._sum.amount ?? 0;
    const totalPendente =
      (pendingAgg._sum.amount ?? 0) - (pendingAgg._sum.paidAmount ?? 0);
    const totalPendentePrev =
      (pendingPrevAgg._sum.amount ?? 0) - (pendingPrevAgg._sum.paidAmount ?? 0);
    const despesasPagas = expensesPaidMonth._sum.amount ?? 0;
    const despesasPagasPrev = expensesPaidPrevMonth._sum.amount ?? 0;
    const resultado = totalRecebido - despesasPagas;
    const resultadoPrev = totalRecebidoPrev - despesasPagasPrev;

    const chart30: { label: string; recebimentos: number; despesas: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const recebimentos = payments30
        .filter((p) => p.paidAt >= dayStart && p.paidAt <= dayEnd)
        .reduce((s, p) => s + p.amount, 0);
      const despesas = expenses30
        .filter((e) => e.date >= dayStart && e.date <= dayEnd)
        .reduce((s, e) => s + e.amount, 0);

      chart30.push({ label, recebimentos, despesas });
      void key;
    }

    const proximosVencimentos = [
      ...receivables
        .filter((r) => r.status !== "PAID")
        .map((r) => ({
          id: r.id,
          tipo: "receber" as const,
          descricao: r.description,
          cliente: r.customer.name,
          vencimento: r.dueDate.toISOString(),
          valor: r.amount - r.paidAmount,
        })),
      ...expenses
        .filter((e) => e.status === "PENDING")
        .map((e) => ({
          id: e.id,
          tipo: "despesa" as const,
          descricao: e.description,
          cliente: e.supplier ?? undefined,
          vencimento: (e.dueDate ?? e.date).toISOString(),
          valor: e.amount,
        })),
    ]
      .sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime())
      .slice(0, 5);

    return NextResponse.json({
      kpis: {
        totalVendido: { value: totalVendido, trend: pctChange(totalVendido, totalVendidoPrev) },
        totalRecebido: { value: totalRecebido, trend: pctChange(totalRecebido, totalRecebidoPrev) },
        totalPendente: { value: totalPendente, trend: pctChange(totalPendente, totalPendentePrev) },
        despesasPagas: { value: despesasPagas, trend: pctChange(despesasPagas, despesasPagasPrev) },
        resultado: { value: resultado, trend: pctChange(resultado, resultadoPrev) },
      },
      chart30,
      proximosVencimentos,
    });
  });
}
