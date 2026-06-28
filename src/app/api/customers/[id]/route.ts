import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  return withAuth(async (user) => {
    const { id } = await params;
    const customer = await prisma.customer.findFirst({
      where: { id, companyId: user.companyId },
      include: {
        _count: { select: { sales: true } },
        receivables: {
          where: { status: { in: ["OPEN", "PARTIAL", "OVERDUE"] } },
          orderBy: { dueDate: "asc" },
          select: {
            id: true,
            description: true,
            amount: true,
            paidAmount: true,
            dueDate: true,
            status: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const pendingAmount = customer.receivables.reduce(
      (sum, r) => sum + (r.amount - r.paidAmount),
      0,
    );

    return NextResponse.json({ ...customer, pendingAmount });
  });
}

export async function PUT(request: Request, { params }: Params) {
  return withAuth(async (user) => {
    const { id } = await params;
    const body = await request.json();
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const existing = await prisma.customer.findFirst({ where: { id, companyId: user.companyId } });
    if (!existing) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        phone: body.phone?.trim() || null,
        email: body.email?.trim() || null,
        document: body.document?.trim() || null,
        address: body.address?.trim() || null,
        notes: body.notes?.trim() || null,
        category: body.category?.trim() || null,
        active: body.active !== false,
      },
    });

    return NextResponse.json(customer);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withAuth(async (user) => {
    const { id } = await params;

    const customer = await prisma.customer.findFirst({ where: { id, companyId: user.companyId } });
    if (!customer) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const salesCount = await prisma.sale.count({ where: { customerId: id } });
    if (salesCount > 0) {
      await prisma.customer.update({ where: { id }, data: { active: false } });
      return NextResponse.json({ ok: true, inactivated: true });
    }

    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  });
}
