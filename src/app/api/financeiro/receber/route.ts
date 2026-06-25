import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withFinancialAccess } from "@/lib/api";

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

    const [receivables, paymentsMonth, paymentsPrevMonth, payments30] = await Promise.all([
      prisma.receivable.findMany({
        where: { companyId: user.companyId },
        include: { customer: { select: { id: true, name: true } } },
        orderBy: { dueDate: "asc" },
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
      prisma.receivablePayment.findMany({
        where: {
          receivable: { companyId: user.companyId },
          paidAt: { gte: startOf30Days },
        },
        select: { paidAt: true, amount: true },
      }),
    ]);

    const open = receivables.filter((r) => r.status !== "PAID");
    const emAberto = open.reduce((s, r) => s + (r.amount - r.paidAmount), 0);
    const vencidasList = receivables.filter((r) => r.status === "OVERDUE");
    const vencidas = vencidasList.reduce((s, r) => s + (r.amount - r.paidAmount), 0);
    const parciais = receivables.filter((r) => r.status === "PARTIAL").length;
    const recebidoMes = paymentsMonth._sum.amount ?? 0;
    const recebidoMesPrev = paymentsPrevMonth._sum.amount ?? 0;

    const chart30: { label: string; valor: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
      const valor = payments30
        .filter((p) => p.paidAt >= dayStart && p.paidAt <= dayEnd)
        .reduce((s, p) => s + p.amount, 0);
      chart30.push({ label, valor });
    }

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const agingBuckets = [
      { faixa: "A vencer (0–7d)", min: 0, max: 7 },
      { faixa: "8–30 dias", min: 8, max: 30 },
      { faixa: "31–60 dias", min: 31, max: 60 },
      { faixa: "60+ dias", min: 61, max: Infinity },
    ];

    const aging = agingBuckets.map(({ faixa, min, max }) => {
      const items = open.filter((r) => {
        const due = new Date(r.dueDate);
        const diffDays = Math.floor((due.getTime() - today.getTime()) / 86400000);
        if (max === Infinity) return diffDays >= min || r.status === "OVERDUE";
        return diffDays >= min && diffDays <= max;
      });
      return {
        faixa,
        valor: items.reduce((s, r) => s + (r.amount - r.paidAmount), 0),
        count: items.length,
      };
    });

    return NextResponse.json({
      kpis: {
        emAberto: { value: emAberto, trend: pctChange(emAberto, emAberto) },
        vencidas: { value: vencidas, count: vencidasList.length },
        parciais: { value: parciais, count: parciais },
        recebidoMes: {
          value: recebidoMes,
          trend: pctChange(recebidoMes, recebidoMesPrev),
        },
      },
      chart30,
      aging,
      items: receivables.map((r) => ({
        id: r.id,
        description: r.description,
        amount: r.amount,
        paidAmount: r.paidAmount,
        saldo: r.amount - r.paidAmount,
        dueDate: r.dueDate.toISOString(),
        status: r.status,
        customer: r.customer,
      })),
    });
  });
}
