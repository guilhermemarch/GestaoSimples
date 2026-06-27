import type { PaymentMethod, ServiceOrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createSale } from "@/lib/sales";

export type ServiceOrderItemInput = {
  productId?: string;
  description?: string;
  quantity: number;
  unitPrice?: number;
};

function computeTotal(laborCost: number, items: { subtotal: number }[]) {
  return laborCost + items.reduce((sum, i) => sum + i.subtotal, 0);
}

async function resolveItems(
  companyId: string,
  items: ServiceOrderItemInput[],
): Promise<{ productId: string | null; description: string | null; quantity: number; unitPrice: number; subtotal: number }[]> {
  const resolved = [];
  for (const item of items) {
    if (item.productId) {
      const product = await prisma.product.findFirst({
        where: { id: item.productId, companyId },
      });
      if (!product) throw new Error(`Produto não encontrado: ${item.productId}`);
      const qty = item.quantity || 1;
      const price = item.unitPrice ?? product.price;
      resolved.push({
        productId: product.id,
        description: null,
        quantity: qty,
        unitPrice: price,
        subtotal: price * qty,
      });
    } else if (item.description) {
      const qty = item.quantity || 1;
      const price = item.unitPrice ?? 0;
      resolved.push({
        productId: null,
        description: item.description,
        quantity: qty,
        unitPrice: price,
        subtotal: price * qty,
      });
    }
  }
  return resolved;
}

export async function createServiceOrder(
  companyId: string,
  userId: string,
  data: {
    customerId: string;
    description: string;
    laborCost?: number;
    estimatedDate?: string;
    notes?: string;
    items?: ServiceOrderItemInput[];
  },
) {
  const customer = await prisma.customer.findFirst({
    where: { id: data.customerId, companyId },
  });
  if (!customer) throw new Error("Cliente não encontrado");

  const laborCost = data.laborCost ?? 0;
  const itemRows = await resolveItems(companyId, data.items ?? []);
  const total = computeTotal(laborCost, itemRows);

  return prisma.serviceOrder.create({
    data: {
      companyId,
      customerId: data.customerId,
      description: data.description,
      laborCost,
      total,
      estimatedDate: data.estimatedDate ? new Date(data.estimatedDate) : null,
      notes: data.notes ?? null,
      items: { create: itemRows },
      history: {
        create: {
          fromStatus: null,
          toStatus: "QUOTE",
          userId,
          note: "Ordem criada",
        },
      },
    },
    include: {
      customer: { select: { id: true, name: true } },
      items: { include: { product: { select: { id: true, name: true } } } },
      history: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function updateServiceOrder(
  companyId: string,
  orderId: string,
  data: {
    description?: string;
    laborCost?: number;
    estimatedDate?: string | null;
    notes?: string | null;
    items?: ServiceOrderItemInput[];
  },
) {
  const order = await prisma.serviceOrder.findFirst({
    where: { id: orderId, companyId },
    include: { items: true },
  });
  if (!order) throw new Error("Ordem não encontrada");
  if (order.status === "CANCELLED" || order.saleId) {
    throw new Error("Ordem não pode ser editada neste status");
  }

  const laborCost = data.laborCost ?? order.laborCost;
  let itemRows: { productId: string | null; description: string | null; quantity: number; unitPrice: number; subtotal: number }[];

  if (data.items) {
    await prisma.serviceOrderItem.deleteMany({ where: { serviceOrderId: orderId } });
    itemRows = await resolveItems(companyId, data.items);
  } else {
    itemRows = order.items.map((i) => ({
      productId: i.productId,
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      subtotal: i.subtotal,
    }));
  }

  const total = computeTotal(laborCost, itemRows);

  return prisma.serviceOrder.update({
    where: { id: orderId },
    data: {
      description: data.description ?? order.description,
      laborCost,
      total,
      estimatedDate:
        data.estimatedDate === null
          ? null
          : data.estimatedDate
            ? new Date(data.estimatedDate)
            : order.estimatedDate,
      notes: data.notes !== undefined ? data.notes : order.notes,
      ...(data.items
        ? {
            items: {
              create: itemRows.map((i) => ({
                productId: i.productId,
                description: i.description,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                subtotal: i.subtotal,
              })),
            },
          }
        : {}),
    },
    include: {
      customer: { select: { id: true, name: true } },
      items: { include: { product: { select: { id: true, name: true } } } },
      history: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function changeServiceOrderStatus(
  companyId: string,
  orderId: string,
  userId: string,
  toStatus: ServiceOrderStatus,
  note?: string,
) {
  const order = await prisma.serviceOrder.findFirst({ where: { id: orderId, companyId } });
  if (!order) throw new Error("Ordem não encontrada");
  if (order.saleId) throw new Error("Ordem já convertida em venda");
  if (order.status === "CANCELLED") throw new Error("Ordem cancelada");

  return prisma.$transaction(async (tx) => {
    await tx.serviceOrderStatusHistory.create({
      data: {
        serviceOrderId: orderId,
        fromStatus: order.status,
        toStatus,
        userId,
        note: note ?? null,
      },
    });
    return tx.serviceOrder.update({
      where: { id: orderId },
      data: { status: toStatus },
      include: {
        customer: { select: { id: true, name: true } },
        items: { include: { product: { select: { id: true, name: true } } } },
        history: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } },
      },
    });
  });
}

export async function convertServiceOrderToSale(
  companyId: string,
  orderId: string,
  userId: string,
  options: { paymentMethod?: PaymentMethod; amountReceived?: number },
) {
  const order = await prisma.serviceOrder.findFirst({
    where: { id: orderId, companyId },
    include: { items: true },
  });
  if (!order) throw new Error("Ordem não encontrada");
  if (order.saleId) throw new Error("Ordem já convertida");
  if (!["COMPLETED", "DELIVERED"].includes(order.status)) {
    throw new Error("Somente ordens concluídas ou entregues podem virar venda");
  }

  const productItems = order.items.filter((i) => i.productId);
  const sale = await createSale(
    companyId,
    order.customerId,
    productItems.map((i) => ({ productId: i.productId!, quantity: i.quantity })),
    {
      paymentMethod: options.paymentMethod ?? "CASH",
      amountReceived: options.amountReceived,
    },
  );

  if (order.laborCost > 0) {
    await prisma.sale.update({
      where: { id: sale.id },
      data: { total: sale.total + order.laborCost },
    });
  }

  return prisma.serviceOrder.update({
    where: { id: orderId },
    data: {
      saleId: sale.id,
      status: "DELIVERED",
      history: {
        create: {
          fromStatus: order.status,
          toStatus: "DELIVERED",
          userId,
          note: `Convertida em venda ${sale.id}`,
        },
      },
    },
    include: {
      customer: true,
      items: { include: { product: true } },
      sale: true,
      history: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
}
