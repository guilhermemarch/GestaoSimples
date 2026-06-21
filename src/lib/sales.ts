import type { PaymentMethod, SaleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type SaleItemInput = { productId: string; quantity: number };
type PaymentInput = { method: PaymentMethod; amount: number };

const MAX_DISCOUNT_PCT = 0.1;

function computeReceivableStatus(amount: number, paidAmount: number, dueDate: Date) {
  const now = new Date();
  if (paidAmount >= amount) return "PAID" as const;
  if (paidAmount > 0) return "PARTIAL" as const;
  if (dueDate < now) return "OVERDUE" as const;
  return "OPEN" as const;
}

export async function createSale(
  companyId: string,
  customerId: string,
  items: SaleItemInput[],
  options: {
    paymentMethod?: PaymentMethod;
    payments?: PaymentInput[];
    amountReceived?: number;
    dueDate?: string;
    discount?: number;
    notes?: string;
    status?: SaleStatus;
  },
) {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, companyId },
  });
  if (!customer) throw new Error("Cliente não encontrado");

  const isQuote = options.status === "QUOTE";

  const payments = options.payments?.length
    ? options.payments
    : options.paymentMethod
      ? [{ method: options.paymentMethod, amount: 0 }]
      : [{ method: "CASH" as PaymentMethod, amount: 0 }];

  const primaryMethod = payments.length === 1 ? payments[0].method : payments[0]?.method ?? "CASH";

  const hasCash = payments.some((p) => p.method === "CASH");
  let cashSession = null;
  if (!isQuote && (hasCash || primaryMethod === "CASH")) {
    cashSession = await prisma.cashSession.findFirst({
      where: { companyId, status: "OPEN" },
    });
    if (!cashSession) {
      throw new Error("Caixa não está aberto. Abra o caixa antes de registrar venda em dinheiro.");
    }
  }

  return prisma.$transaction(async (tx) => {
    let subtotal = 0;
    const lineItems: {
      productId: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }[] = [];

    for (const item of items) {
      const product = await tx.product.findFirst({
        where: { id: item.productId, companyId },
      });
      if (!product) throw new Error(`Produto não encontrado: ${item.productId}`);
      if (item.quantity <= 0) throw new Error("Quantidade deve ser maior que zero");
      if (!isQuote && product.stock < item.quantity) {
        throw new Error(
          `Estoque insuficiente para "${product.name}". Disponível: ${product.stock}`,
        );
      }

      const lineSubtotal = product.price * item.quantity;
      subtotal += lineSubtotal;
      lineItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: lineSubtotal,
      });
    }

    const discount = Math.max(0, options.discount ?? 0);
    if (discount > subtotal * MAX_DISCOUNT_PCT) {
      throw new Error(`Desconto acima do limite permitido (${MAX_DISCOUNT_PCT * 100}%)`);
    }
    const total = Math.max(0, subtotal - discount);

    const paymentRows = payments.map((p) => ({
      method: p.method,
      amount: p.amount > 0 ? p.amount : total / payments.length,
    }));

    const resolvedMethod =
      paymentRows.length === 1
        ? paymentRows[0].method
        : paymentRows.some((p) => p.method === "PENDING")
          ? "PENDING"
          : primaryMethod;

    const amountReceived = options.amountReceived;
    const changeAmount =
      amountReceived != null && resolvedMethod === "CASH"
        ? Math.max(0, amountReceived - total)
        : null;

    const created = await tx.sale.create({
      data: {
        companyId,
        customerId,
        total,
        discount,
        notes: options.notes?.trim() || null,
        status: isQuote ? "QUOTE" : "CONFIRMED",
        paymentMethod: resolvedMethod,
        amountReceived: amountReceived ?? null,
        changeAmount,
        cashSessionId: cashSession?.id ?? null,
        items: { create: lineItems },
        payments: { create: paymentRows },
      },
      include: {
        customer: true,
        items: { include: { product: true } },
        payments: true,
      },
    });

    if (!isQuote) {
      for (const item of lineItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      if (cashSession && (resolvedMethod === "CASH" || hasCash)) {
        const cashAmount = paymentRows
          .filter((p) => p.method === "CASH")
          .reduce((sum, p) => sum + p.amount, 0);
        if (cashAmount > 0 || resolvedMethod === "CASH") {
          await tx.cashMovement.create({
            data: {
              sessionId: cashSession.id,
              type: "SALE",
              amount: cashAmount > 0 ? cashAmount : total,
              description: `Venda ${created.id}`,
              saleId: created.id,
            },
          });
        }
      }

      const hasPending =
        resolvedMethod === "PENDING" || paymentRows.some((p) => p.method === "PENDING");
      if (hasPending) {
        const pendingAmount = paymentRows
          .filter((p) => p.method === "PENDING")
          .reduce((sum, p) => sum + p.amount, 0);
        const receivableAmount = pendingAmount > 0 ? pendingAmount : total;
        const dueDate = options.dueDate ? new Date(options.dueDate) : new Date(Date.now() + 7 * 86400000);

        await tx.receivable.create({
          data: {
            companyId,
            customerId,
            saleId: created.id,
            description: `Venda ${created.id.slice(-6).toUpperCase()}`,
            amount: receivableAmount,
            dueDate,
            status: computeReceivableStatus(receivableAmount, 0, dueDate),
          },
        });
      }
    }

    return created;
  });
}

export async function cancelSale(
  saleId: string,
  companyId: string,
  userId: string,
  reason: string,
) {
  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findFirst({
      where: { id: saleId, companyId },
      include: { items: true, cashMovements: true },
    });
    if (!sale) throw new Error("Venda não encontrada");
    if (sale.status === "CANCELLED") throw new Error("Venda já cancelada");

    if (sale.status === "CONFIRMED") {
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      for (const movement of sale.cashMovements) {
        await tx.cashMovement.create({
          data: {
            sessionId: movement.sessionId,
            type: "WITHDRAWAL",
            amount: -movement.amount,
            description: `Estorno venda ${sale.id}`,
            saleId: sale.id,
          },
        });
      }

      await tx.receivable.updateMany({
        where: { saleId: sale.id },
        data: { status: "PAID", paidAmount: 0, amount: 0 },
      });
    }

    return tx.sale.update({
      where: { id: saleId },
      data: {
        status: "CANCELLED",
        cancelReason: reason,
        cancelledAt: new Date(),
        cancelledById: userId,
      },
      include: {
        customer: true,
        items: { include: { product: true } },
        payments: true,
      },
    });
  });
}
