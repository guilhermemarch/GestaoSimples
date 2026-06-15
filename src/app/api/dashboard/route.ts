import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [salesToday, salesMonth, customerCount, productCount] = await Promise.all([
    prisma.sale.aggregate({
      where: { createdAt: { gte: startOfDay } },
      _sum: { total: true },
    }),
    prisma.sale.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { total: true },
    }),
    prisma.customer.count(),
    prisma.product.count(),
  ]);

  return NextResponse.json({
    salesToday: salesToday._sum.total ?? 0,
    salesMonth: salesMonth._sum.total ?? 0,
    customerCount,
    productCount,
  });
}
