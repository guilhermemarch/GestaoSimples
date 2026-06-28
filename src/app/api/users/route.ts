import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { withAuth, withRoles } from "@/lib/api";
import type { Role } from "@prisma/client";

export async function GET() {
  return withRoles(["ADMIN", "MANAGER"], async (user) => {
    const users = await prisma.user.findMany({
      where: { companyId: user.companyId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(users);
  });
}

export async function POST(request: Request) {
  return withRoles(["ADMIN"], async (user) => {
    const body = await request.json();
    const email = body.email?.trim();
    const name = body.name?.trim();
    const password = body.password as string;
    const role = (body.role as Role) || "OPERATOR";

    if (!email || !name || !password) {
      return NextResponse.json({ error: "E-mail, nome e senha são obrigatórios" }, { status: 400 });
    }
    if (!["ADMIN", "MANAGER", "OPERATOR"].includes(role)) {
      return NextResponse.json({ error: "Perfil inválido" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 400 });
    }

    const created = await prisma.user.create({
      data: {
        email,
        name,
        role,
        passwordHash: await hash(password, 10),
        companyId: user.companyId,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    return NextResponse.json(created, { status: 201 });
  });
}
