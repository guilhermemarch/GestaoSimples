import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withFinancialAccess } from "@/lib/api";

function pctChange(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? "+100%" : "0%";
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1).replace(".", ",")}%`;
}

function parseMonth(searchParams: URLSearchParams) {
  const raw = searchParams.get("month");
  if (raw && /^\d{4}-\d{2}$/.test(raw)) {
    const [y, m] = raw.split("-").map(Number);
    return { year: y, month: m - 1 };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

export async function GET(request: Request) {
  return withFinancialAccess(async (user) => {
    const { searchParams } = new URL(request.url);
    const { year, month } = parseMonth(searchParams);
    const now = new Date();

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);
    const startOfPrevMonth = new Date(year, month - 1, 1);
    const endOfPrevMonth = new Date(year, month, 0, 23, 59, 59);

    const baseSale = { companyId: user.companyId, status: "CONFIRMED" as const };

    const [
      salesMonth,
      salesPrevMonth,
      paymentsMonth,
      paymentsPrevMonth,
      expensesPaidMonth,
      expensesPaidPrevMonth,
      paymentsInMonth,
      expensesInMonth,
    ] = await Promise.all([
      prisma.sale.aggregate({
        where: { ...baseSale, createdAt: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { total: true },
      }),
      prisma.sale.aggregate({
        where: { ...baseSale, createdAt: { gte: startOfPrevMonth, lte: endOfPrevMonth } },
        _sum: { total: true },
      }),
      prisma.receivablePayment.aggregate({
        where: {
          receivable: { companyId: user.companyId },
          paidAt: { gte: startOfMonth, lte: endOfMonth },
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
      prisma.expense.aggregate({
        where: {
          companyId: user.companyId,
          status: "PAID",
          date: { gte: startOfMonth, lte: endOfMonth },
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
      prisma.receivablePayment.findMany({
        where: {
          receivable: { companyId: user.companyId },
          paidAt: { gte: startOfMonth, lte: endOfMonth },
        },
        include: { receivable: { select: { description: true } } },
        orderBy: { paidAt: "desc" },
      }),
      prisma.expense.findMany({
        where: {
          companyId: user.companyId,
          status: "PAID",
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        orderBy: { date: "desc" },
      }),
    ]);

    const receita = salesMonth._sum.total ?? 0;
    const receitaPrev = salesPrevMonth._sum.total ?? 0;
    const recebimentos = paymentsMonth._sum.amount ?? 0;
    const recebimentosPrev = paymentsPrevMonth._sum.amount ?? 0;
    const despesasPagas = expensesPaidMonth._sum.amount ?? 0;
    const despesasPagasPrev = expensesPaidPrevMonth._sum.amount ?? 0;
    const resultado = recebimentos - despesasPagas;
    const resultadoPrev = recebimentosPrev - despesasPagasPrev;

    const chart6m: { mes: string; receita: number; despesas: number; resultado: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const mes = `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

      const [s, p, e] = await Promise.all([
        prisma.sale.aggregate({
          where: { ...baseSale, createdAt: { gte: mStart, lte: mEnd } },
          _sum: { total: true },
        }),
        prisma.receivablePayment.aggregate({
          where: {
            receivable: { companyId: user.companyId },
            paidAt: { gte: mStart, lte: mEnd },
          },
          _sum: { amount: true },
        }),
        prisma.expense.aggregate({
          where: {
            companyId: user.companyId,
            status: "PAID",
            date: { gte: mStart, lte: mEnd },
          },
          _sum: { amount: true },
        }),
      ]);

      const rec = p._sum.amount ?? 0;
      const desp = e._sum.amount ?? 0;
      chart6m.push({
        mes,
        receita: s._sum.total ?? 0,
        despesas: desp,
        resultado: rec - desp,
      });
    }

    const weeksInMonth = Math.ceil(endOfMonth.getDate() / 7);
    const chartSemanal: { semana: string; entradas: number; saidas: number }[] = [];
    for (let w = 0; w < weeksInMonth; w++) {
      const wStart = new Date(year, month, w * 7 + 1);
      const wEnd = new Date(year, month, Math.min((w + 1) * 7, endOfMonth.getDate()), 23, 59, 59);
      if (wStart > endOfMonth) break;

      const entradas = paymentsInMonth
        .filter((p) => p.paidAt >= wStart && p.paidAt <= wEnd)
        .reduce((s, p) => s + p.amount, 0);
      const saidas = expensesInMonth
        .filter((e) => e.date >= wStart && e.date <= wEnd)
        .reduce((s, e) => s + e.amount, 0);

      chartSemanal.push({ semana: `Sem ${w + 1}`, entradas, saidas });
    }

    const dre = [
      { linha: "Vendas", valor: receita, tipo: "entrada" as const },
      { linha: "Recebimentos", valor: recebimentos, tipo: "entrada" as const },
      { linha: "Despesas operacionais", valor: despesasPagas, tipo: "saida" as const },
      { linha: "Resultado", valor: resultado, tipo: "resultado" as const },
    ];

    const movimentos = [
      ...paymentsInMonth.map((p) => ({
        id: p.id,
        tipo: "entrada" as const,
        descricao: p.receivable.description,
        valor: p.amount,
        data: p.paidAt.toISOString(),
      })),
      ...expensesInMonth.map((e) => ({
        id: e.id,
        tipo: "saida" as const,
        descricao: e.description,
        valor: e.amount,
        data: e.date.toISOString(),
      })),
    ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    return NextResponse.json({
      kpis: {
        receita: { value: receita, trend: pctChange(receita, receitaPrev) },
        recebimentos: { value: recebimentos, trend: pctChange(recebimentos, recebimentosPrev) },
        despesasPagas: { value: despesasPagas, trend: pctChange(despesasPagas, despesasPagasPrev) },
        resultado: { value: resultado, trend: pctChange(resultado, resultadoPrev) },
      },
      chart6m,
      chartSemanal,
      dre,
      movimentos,
    });
  });
}
