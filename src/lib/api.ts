import { NextResponse } from "next/server";
import {
  canAccessFinancials,
  getSessionUser,
  requireRole,
  type SessionUser,
} from "./auth";
import type { Role } from "@prisma/client";

export async function withAuth(
  handler: (user: SessionUser) => Promise<NextResponse>,
): Promise<NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  try {
    return await handler(user);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno";
    if (message === "Sem permissão para esta operação") {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function withRoles(
  roles: Role[],
  handler: (user: SessionUser) => Promise<NextResponse>,
): Promise<NextResponse> {
  return withAuth(async (user) => {
    requireRole(user, roles);
    return handler(user);
  });
}

export async function withFinancialAccess(
  handler: (user: SessionUser) => Promise<NextResponse>,
): Promise<NextResponse> {
  return withAuth(async (user) => {
    if (!canAccessFinancials(user)) {
      return NextResponse.json({ error: "Sem permissão para dados financeiros" }, { status: 403 });
    }
    return handler(user);
  });
}

export function companyScope(companyId: string) {
  return { companyId };
}
