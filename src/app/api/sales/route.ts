import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { id: true, name: true } },
      items: {
        include: { product: { select: { id: true, name: true } } },
      },
    },
  });

  return NextResponse.json(sales);
}

type SaleItemInput = { productId: string; quantity: number };

export async function POST(request: Request) {
  const body = await request.json();
  const customerId = body.customerId as string;
  const items = body.items as SaleItemInput[];

  if (!customerId) {
    return NextResponse.json({ error: "Cliente é obrigatório" }, { status: 400 });
  }
  if (!items?.length) {
    return NextResponse.json({ error: "Adicione pelo menos um produto" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
  }

  try {
    const sale = await prisma.$transaction(async (tx) => {
      let total = 0;
      const lineItems: {
        productId: string;
        quantity: number;
        unitPrice: number;
        subtotal: number;
      }[] = [];

      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new Error(`Produto não encontrado: ${item.productId}`);
        }
        if (item.quantity <= 0) {
          throw new Error("Quantidade deve ser maior que zero");
        }
        if (product.stock < item.quantity) {
          throw new Error(
            `Estoque insuficiente para "${product.name}". Disponível: ${product.stock}`,
          );
        }

        const subtotal = product.price * item.quantity;
        total += subtotal;
        lineItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price,
          subtotal,
        });
      }

      const created = await tx.sale.create({
        data: {
          customerId,
          total,
          items: { create: lineItems },
        },
        include: {
          customer: true,
          items: { include: { product: true } },
        },
      });

      for (const item of lineItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return created;
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao registrar venda";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
