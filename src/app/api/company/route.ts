import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, withRoles } from "@/lib/api";

export async function GET() {
  return withAuth(async (user) => {
    const company = await prisma.company.findUnique({ where: { id: user.companyId } });
    if (!company) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }
    return NextResponse.json(company);
  });
}

export async function PUT(request: Request) {
  return withRoles(["ADMIN", "MANAGER"], async (user) => {
    const body = await request.json();
    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const company = await prisma.company.update({
      where: { id: user.companyId },
      data: {
        name,
        tradeName: body.tradeName?.trim() || null,
        document: body.document?.trim() || null,
        phone: body.phone?.trim() || null,
        address: body.address?.trim() || null,
        addressStreet: body.addressStreet?.trim() || body.address?.trim() || null,
        addressNeighborhood: body.addressNeighborhood?.trim() || null,
        addressCity: body.addressCity?.trim() || null,
        addressState: body.addressState?.trim() || null,
        addressZip: body.addressZip?.trim() || null,
        segment: body.segment?.trim() || null,
        planName: body.planName?.trim() || undefined,
        maxUsers: body.maxUsers != null ? Number(body.maxUsers) : undefined,
      },
    });

    return NextResponse.json(company);
  });
}
