import { prisma } from "@/lib/prisma";

export type Alert = {
  type: string;
  severity: "warning" | "info";
  message: string;
  href: string;
  data?: unknown;
};

const ALERT_HREF: Record<string, string> = {
  LOW_STOCK: "/estoque",
  OVERDUE_RECEIVABLE: "/financeiro/contas-a-receber",
  EXPENSE_DUE: "/financeiro/despesas",
  CASH_STILL_OPEN: "/caixa",
  CASH_CLOSED: "/caixa",
  SERVICE_OVERDUE: "/servicos",
};

const MAX_ALERTS = 3;
const MAX_ITEMS_PER_TYPE = 1;

export async function getAlerts(companyId: string): Promise<Alert[]> {
  const now = new Date();
  const inThreeDays = new Date(now.getTime() + 3 * 86400000);

  const overdueReceivableWhere = { companyId, status: "OVERDUE" as const };
  const expenseDueWhere = {
    companyId,
    status: "PENDING" as const,
    dueDate: { lte: inThreeDays },
  };

  const [
    products,
    overdueReceivables,
    overdueReceivableCount,
    openCash,
    overdueExpenses,
    overdueExpenseCount,
    overdueServices,
    overdueServiceCount,
  ] = await Promise.all([
    prisma.product.findMany({
      where: { companyId, active: true },
      select: { id: true, name: true, stock: true, minStock: true },
    }),
    prisma.receivable.findMany({
      where: overdueReceivableWhere,
      include: { customer: { select: { id: true, name: true } } },
      take: MAX_ITEMS_PER_TYPE,
      orderBy: { dueDate: "asc" },
    }),
    prisma.receivable.count({ where: overdueReceivableWhere }),
    prisma.cashSession.findFirst({ where: { companyId, status: "OPEN" } }),
    prisma.expense.findMany({
      where: expenseDueWhere,
      take: MAX_ITEMS_PER_TYPE,
      orderBy: { dueDate: "asc" },
    }),
    prisma.expense.count({ where: expenseDueWhere }),
    prisma.serviceOrder.findMany({
      where: {
        companyId,
        status: { notIn: ["DELIVERED", "CANCELLED"] },
        estimatedDate: { lt: now },
        saleId: null,
      },
      include: { customer: { select: { name: true } } },
      take: MAX_ITEMS_PER_TYPE,
      orderBy: { estimatedDate: "asc" },
    }),
    prisma.serviceOrder.count({
      where: {
        companyId,
        status: { notIn: ["DELIVERED", "CANCELLED"] },
        estimatedDate: { lt: now },
        saleId: null,
      },
    }),
  ]);

  const alerts: Alert[] = [];

  const lowStock = products.filter((p) => p.stock <= p.minStock);
  for (const product of lowStock.slice(0, MAX_ITEMS_PER_TYPE)) {
    alerts.push({
      type: "LOW_STOCK",
      severity: "warning",
      message: `Estoque baixo: ${product.name} (${product.stock} un.)`,
      href: ALERT_HREF.LOW_STOCK,
      data: { productId: product.id },
    });
  }
  if (lowStock.length > MAX_ITEMS_PER_TYPE) {
    alerts.push({
      type: "LOW_STOCK",
      severity: "warning",
      message: `Mais ${lowStock.length - MAX_ITEMS_PER_TYPE} produto(s) com estoque baixo`,
      href: ALERT_HREF.LOW_STOCK,
    });
  }

  for (const receivable of overdueReceivables) {
    alerts.push({
      type: "OVERDUE_RECEIVABLE",
      severity: "warning",
      message: `Conta vencida: ${receivable.customer.name} — R$ ${(receivable.amount - receivable.paidAmount).toFixed(2)}`,
      href: ALERT_HREF.OVERDUE_RECEIVABLE,
      data: { receivableId: receivable.id },
    });
  }
  if (overdueReceivableCount > MAX_ITEMS_PER_TYPE) {
    alerts.push({
      type: "OVERDUE_RECEIVABLE",
      severity: "warning",
      message: `Mais ${overdueReceivableCount - MAX_ITEMS_PER_TYPE} conta(s) vencida(s)`,
      href: ALERT_HREF.OVERDUE_RECEIVABLE,
    });
  }

  if (!openCash) {
    alerts.push({
      type: "CASH_CLOSED",
      severity: "info",
      message: "Caixa ainda não foi aberto hoje",
      href: ALERT_HREF.CASH_CLOSED,
    });
  } else {
    const hoursOpen = (now.getTime() - openCash.openedAt.getTime()) / 3600000;
    if (hoursOpen > 12) {
      alerts.push({
        type: "CASH_STILL_OPEN",
        severity: "info",
        message: "Caixa aberto há mais de 12 horas",
        href: ALERT_HREF.CASH_STILL_OPEN,
        data: { sessionId: openCash.id },
      });
    }
  }

  for (const expense of overdueExpenses) {
    alerts.push({
      type: "EXPENSE_DUE",
      severity: "warning",
      message: `Despesa próxima/vencida: ${expense.description}`,
      href: ALERT_HREF.EXPENSE_DUE,
      data: { expenseId: expense.id },
    });
  }
  if (overdueExpenseCount > MAX_ITEMS_PER_TYPE) {
    alerts.push({
      type: "EXPENSE_DUE",
      severity: "warning",
      message: `Mais ${overdueExpenseCount - MAX_ITEMS_PER_TYPE} despesa(s) próxima(s)/vencida(s)`,
      href: ALERT_HREF.EXPENSE_DUE,
    });
  }

  for (const svc of overdueServices) {
    alerts.push({
      type: "SERVICE_OVERDUE",
      severity: "warning",
      message: `OS atrasada: ${svc.customer.name}`,
      href: ALERT_HREF.SERVICE_OVERDUE,
      data: { serviceOrderId: svc.id },
    });
  }
  if (overdueServiceCount > MAX_ITEMS_PER_TYPE) {
    alerts.push({
      type: "SERVICE_OVERDUE",
      severity: "warning",
      message: `Mais ${overdueServiceCount - MAX_ITEMS_PER_TYPE} ordem(ns) de serviço atrasada(s)`,
      href: ALERT_HREF.SERVICE_OVERDUE,
    });
  }

  return alerts.slice(0, MAX_ALERTS);
}
