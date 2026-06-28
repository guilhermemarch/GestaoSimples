import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";

export async function GET(request: Request) {
  return withAuth(async (user) => {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    if (!q || q.length < 2) {
      return NextResponse.json({ customers: [], products: [], sales: [] });
    }

    const [customers, products, sales] = await Promise.all([
      prisma.customer.findMany({
        where: {
          companyId: user.companyId,
          active: true,
          OR: [
            { name: { contains: q } },
            { phone: { contains: q } },
            { document: { contains: q } },
          ],
        },
        take: 5,
        select: { id: true, name: true, phone: true },
      }),
      prisma.product.findMany({
        where: {
          companyId: user.companyId,
          active: true,
          OR: [{ name: { contains: q } }, { sku: { contains: q } }],
        },
        take: 5,
        select: { id: true, name: true, price: true, sku: true },
      }),
      prisma.sale.findMany({
        where: {
          companyId: user.companyId,
          status: "CONFIRMED",
          OR: [
            { id: { contains: q } },
            { customer: { name: { contains: q } } },
          ],
        },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          total: true,
          createdAt: true,
          customer: { select: { name: true } },
        },
      }),
    ]);

    return NextResponse.json({ customers, products, sales });
  });
}
