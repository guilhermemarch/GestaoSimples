import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";

export async function GET() {
  return withAuth(async (user) => {
    const session = await prisma.cashSession.findFirst({
      where: { companyId: user.companyId, status: "OPEN" },
      include: {
        openedBy: { select: { id: true, name: true } },
        movements: { orderBy: { createdAt: "desc" } },
        sales: { select: { id: true, total: true, paymentMethod: true } },
      },
    });

    if (!session) {
      return NextResponse.json({ open: false, session: null });
    }

    const byMethod = session.sales.reduce(
      (acc, sale) => {
        acc[sale.paymentMethod] = (acc[sale.paymentMethod] ?? 0) + sale.total;
        return acc;
      },
      {} as Record<string, number>,
    );

    const { sales, ...sessionData } = session;

    return NextResponse.json({
      open: true,
      session: {
        ...sessionData,
        salesCount: sales.length,
      },
      byMethod,
    });
  });
}
