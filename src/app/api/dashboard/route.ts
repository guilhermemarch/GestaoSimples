import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";
import { PAYMENT_METHOD_LABELS } from "@/lib/labels";

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function buildSalesSeries(
  sales: { createdAt: Date; total: number }[],
  days: number,
  now: Date,
): { label: string; value: number }[] {
  const buckets: { label: string; value: number; date: Date }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    buckets.push({ label: DAY_LABELS[d.getDay()], value: 0, date: d });
  }
  for (const sale of sales) {
    const saleDate = new Date(sale.createdAt);
    const dayStart = new Date(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate());
    const bucket = buckets.find((b) => b.date.getTime() === dayStart.getTime());
    if (bucket) bucket.value += sale.total;
  }
  return buckets.map(({ label, value }) => ({ label, value }));
}

function pctChange(today: number, yesterday: number) {
  if (yesterday <= 0) return today > 0 ? "+100% vs. ontem" : undefined;
  const pct = ((today - yesterday) / yesterday) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1).replace(".", ",")}% vs. ontem`;
}

export async function GET(request: Request) {
  return withAuth(async (user) => {
    const { searchParams } = new URL(request.url);
    const salesPeriod = searchParams.get("salesPeriod") ?? "7d";
    const paymentPeriod = searchParams.get("paymentPeriod") ?? "today";

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const salesDays = salesPeriod === "30d" ? 30 : 7;
    const startOfSalesPeriod = new Date(startOfDay.getTime() - (salesDays - 1) * 86400000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const yesterdayStart = new Date(startOfDay.getTime() - 86400000);
    const dayBeforeYesterday = new Date(startOfDay.getTime() - 2 * 86400000);

    const baseWhere = { companyId: user.companyId, status: "CONFIRMED" as const };

    const [
      salesToday,
      salesMonth,
      salesCountToday,
      salesYesterday,
      salesDayBefore,
      customerCount,
      productCount,
      lowStockProducts,
      openCashSession,
      receivedTodayAgg,
      receivedYesterdayAgg,
      pendingTodayAgg,
      pendingYesterdayAgg,
      quoteExpiringCount,
      salesPeriodRaw,
      paymentTodayGroups,
      paymentMonthGroups,
    ] = await Promise.all([
      prisma.sale.aggregate({
        where: { ...baseWhere, createdAt: { gte: startOfDay } },
        _sum: { total: true },
      }),
      prisma.sale.aggregate({
        where: { ...baseWhere, createdAt: { gte: startOfMonth } },
        _sum: { total: true },
      }),
      prisma.sale.count({
        where: { ...baseWhere, createdAt: { gte: startOfDay } },
      }),
      prisma.sale.aggregate({
        where: { ...baseWhere, createdAt: { gte: yesterdayStart, lt: startOfDay } },
        _sum: { total: true },
      }),
      prisma.sale.aggregate({
        where: { ...baseWhere, createdAt: { gte: dayBeforeYesterday, lt: yesterdayStart } },
        _sum: { total: true },
      }),
      prisma.customer.count({ where: { companyId: user.companyId, active: true } }),
      prisma.product.count({ where: { companyId: user.companyId, active: true } }),
      prisma.product.findMany({
        where: { companyId: user.companyId, active: true },
      }),
      prisma.cashSession.findFirst({
        where: { companyId: user.companyId, status: "OPEN" },
        include: { movements: true },
      }),
      prisma.receivablePayment.aggregate({
        where: {
          receivable: { companyId: user.companyId },
          paidAt: { gte: startOfDay },
        },
        _sum: { amount: true },
      }),
      prisma.receivablePayment.aggregate({
        where: {
          receivable: { companyId: user.companyId },
          paidAt: { gte: yesterdayStart, lt: startOfDay },
        },
        _sum: { amount: true },
      }),
      prisma.receivable.aggregate({
        where: {
          companyId: user.companyId,
          status: { in: ["OPEN", "PARTIAL", "OVERDUE"] },
          dueDate: { lte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59) },
        },
        _sum: { amount: true, paidAmount: true },
      }),
      prisma.receivable.aggregate({
        where: {
          companyId: user.companyId,
          status: { in: ["OPEN", "PARTIAL", "OVERDUE"] },
          createdAt: { lt: startOfDay },
        },
        _sum: { amount: true, paidAmount: true },
      }),
      prisma.serviceOrder.count({
        where: {
          companyId: user.companyId,
          status: "QUOTE",
          estimatedDate: { lte: new Date(now.getTime() + 7 * 86400000) },
        },
      }),
      prisma.sale.findMany({
        where: { ...baseWhere, createdAt: { gte: startOfSalesPeriod } },
        select: { createdAt: true, total: true },
      }),
      prisma.sale.groupBy({
        by: ["paymentMethod"],
        where: { ...baseWhere, createdAt: { gte: startOfDay } },
        _sum: { total: true },
      }),
      prisma.sale.groupBy({
        by: ["paymentMethod"],
        where: { ...baseWhere, createdAt: { gte: startOfMonth } },
        _sum: { total: true },
      }),
    ]);

    const lowStock = lowStockProducts.filter((p) => p.stock <= p.minStock);
    const salesChart = buildSalesSeries(salesPeriodRaw, salesDays, now);

    const paymentGroups = paymentPeriod === "month" ? paymentMonthGroups : paymentTodayGroups;
    const paymentMethods = paymentGroups.map((g) => ({
      name: PAYMENT_METHOD_LABELS[g.paymentMethod] ?? g.paymentMethod,
      value: g._sum.total ?? 0,
    }));

    const salesTodayTotal = salesToday._sum.total ?? 0;
    const salesYesterdayTotal = salesYesterday._sum.total ?? 0;
    const receivedToday = receivedTodayAgg._sum.amount ?? salesTodayTotal;
    const receivedYesterday = receivedYesterdayAgg._sum.amount ?? salesYesterdayTotal;
    const pendingToday =
      (pendingTodayAgg._sum.amount ?? 0) - (pendingTodayAgg._sum.paidAmount ?? 0);
    const pendingYesterday =
      (pendingYesterdayAgg._sum.amount ?? 0) - (pendingYesterdayAgg._sum.paidAmount ?? 0);
    const avgTicketToday = salesCountToday > 0 ? salesTodayTotal / salesCountToday : 0;
    const salesCountYesterday = await prisma.sale.count({
      where: { ...baseWhere, createdAt: { gte: yesterdayStart, lt: startOfDay } },
    });
    const avgTicketYesterday =
      salesCountYesterday > 0 ? salesYesterdayTotal / salesCountYesterday : 0;

    const [pendingReceivables, overdueReceivables, monthExpenses, topProducts] =
      await Promise.all([
        prisma.receivable.aggregate({
          where: {
            companyId: user.companyId,
            status: { in: ["OPEN", "PARTIAL", "OVERDUE"] },
          },
          _sum: { amount: true, paidAmount: true },
        }),
        prisma.receivable.count({
          where: { companyId: user.companyId, status: "OVERDUE" },
        }),
        prisma.expense.aggregate({
          where: { companyId: user.companyId, date: { gte: startOfMonth } },
          _sum: { amount: true },
        }),
        prisma.saleItem.groupBy({
          by: ["productId"],
          where: {
            sale: {
              companyId: user.companyId,
              status: "CONFIRMED",
              createdAt: { gte: startOfDay },
            },
          },
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: "desc" } },
          take: 5,
        }),
      ]);

    const pendingTotal =
      (pendingReceivables._sum.amount ?? 0) - (pendingReceivables._sum.paidAmount ?? 0);

    const productIds = topProducts.map((p) => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, imageUrl: true },
    });
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    const response: Record<string, unknown> = {
      salesToday: salesTodayTotal,
      salesMonth: salesMonth._sum.total ?? 0,
      salesCountToday,
      averageTicketToday: avgTicketToday,
      customerCount,
      productCount,
      lowStockCount: lowStock.length,
      cashOpen: !!openCashSession,
      cashOpenedAt: openCashSession?.openedAt ?? null,
      receivedToday,
      pendingToday,
      quoteExpiringCount,
      salesLast7Days: salesChart,
      paymentMethodsToday: paymentMethods,
      paymentMethodsMonth: paymentMonthGroups.map((g) => ({
        name: PAYMENT_METHOD_LABELS[g.paymentMethod] ?? g.paymentMethod,
        value: g._sum.total ?? 0,
      })),
      pendingReceivables: pendingTotal,
      overdueReceivablesCount: overdueReceivables,
      monthExpenses: monthExpenses._sum.amount ?? 0,
      topProducts: topProducts.map((p) => ({
        productId: p.productId,
        name: productMap[p.productId]?.name ?? "—",
        imageUrl: productMap[p.productId]?.imageUrl ?? null,
        quantity: p._sum.quantity ?? 0,
      })),
      trends: {
        salesToday: pctChange(salesTodayTotal, salesYesterdayTotal),
        receivedToday: pctChange(receivedToday, receivedYesterday),
        pendingToday: pctChange(pendingToday, pendingYesterday),
        averageTicket: pctChange(avgTicketToday, avgTicketYesterday),
      },
    };

    if (openCashSession) {
      const movements = openCashSession.movements;
      response.estimatedCashBalance =
        openCashSession.openingAmount + movements.reduce((sum, m) => sum + m.amount, 0);
    }

    return NextResponse.json(response);
  });
}
