import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, withRoles } from "@/lib/api";
import { parseCompanySettings } from "@/lib/company-settings";

export async function GET() {
  return withAuth(async (user) => {
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      include: { _count: { select: { users: true } } },
    });
    if (!company) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }
    return NextResponse.json({
      planName: company.planName ?? "Profissional",
      maxUsers: company.maxUsers,
      activeUsers: company._count.users,
      settings: parseCompanySettings(company.settingsJson),
      addressStreet: company.addressStreet,
      addressNeighborhood: company.addressNeighborhood,
      addressCity: company.addressCity,
      addressState: company.addressState,
      addressZip: company.addressZip,
    });
  });
}

export async function PATCH(request: Request) {
  return withRoles(["ADMIN", "MANAGER"], async (user) => {
    const body = await request.json();
    const company = await prisma.company.findUnique({ where: { id: user.companyId } });
    if (!company) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    const current = parseCompanySettings(company.settingsJson);
    const merged = body.settings ? { ...current, ...body.settings } : current;

    const updated = await prisma.company.update({
      where: { id: user.companyId },
      data: {
        ...(body.planName !== undefined ? { planName: body.planName?.trim() || null } : {}),
        ...(body.maxUsers !== undefined ? { maxUsers: Number(body.maxUsers) || 5 } : {}),
        ...(body.addressStreet !== undefined ? { addressStreet: body.addressStreet?.trim() || null } : {}),
        ...(body.addressNeighborhood !== undefined
          ? { addressNeighborhood: body.addressNeighborhood?.trim() || null }
          : {}),
        ...(body.addressCity !== undefined ? { addressCity: body.addressCity?.trim() || null } : {}),
        ...(body.addressState !== undefined ? { addressState: body.addressState?.trim() || null } : {}),
        ...(body.addressZip !== undefined ? { addressZip: body.addressZip?.trim() || null } : {}),
        settingsJson: JSON.stringify(merged),
      },
    });

    return NextResponse.json({
      settings: parseCompanySettings(updated.settingsJson),
      planName: updated.planName,
      maxUsers: updated.maxUsers,
    });
  });
}
