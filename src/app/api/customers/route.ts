import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";

export async function GET(request: Request) {
  return withAuth(async (user) => {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    const customers = await prisma.customer.findMany({
      where: {
        companyId: user.companyId,
        ...(q ? { name: { contains: q } } : {}),
      },
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { sales: true } },
        receivables: {
          where: { status: { in: ["OPEN", "PARTIAL", "OVERDUE"] } },
          select: { amount: true, paidAmount: true },
        },
        sales: {
          where: { status: "CONFIRMED" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    });

    const result = customers.map((c) => {
      const pendingAmount = c.receivables.reduce(
        (sum, r) => sum + (r.amount - r.paidAmount),
        0,
      );
      const { receivables: _, sales, ...rest } = c;
      return {
        ...rest,
        pendingAmount,
        creditLimit: c.creditLimit ?? null,
        lastSaleDate: sales[0]?.createdAt ?? null,
      };
    });

    return NextResponse.json(result);
  });
}

export async function POST(request: Request) {
  return withAuth(async (user) => {
    const body = await request.json();
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const customer = await prisma.customer.create({
      data: {
        companyId: user.companyId,
        name,
        phone: body.phone?.trim() || null,
        email: body.email?.trim() || null,
        document: body.document?.trim() || null,
        address: body.address?.trim() || null,
        notes: body.notes?.trim() || null,
        category: body.category?.trim() || null,
        creditLimit: body.creditLimit != null ? Number(body.creditLimit) : null,
        active: body.active !== false,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  });
}
