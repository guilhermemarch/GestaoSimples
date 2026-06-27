import { NextResponse } from "next/server";
import { withAuth, withRoles } from "@/lib/api";
import { changeServiceOrderStatus } from "@/lib/service-orders";
import type { ServiceOrderStatus } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

const VALID: ServiceOrderStatus[] = [
  "QUOTE",
  "APPROVED",
  "IN_PROGRESS",
  "WAITING_PARTS",
  "COMPLETED",
  "DELIVERED",
  "CANCELLED",
];

export async function POST(request: Request, { params }: Params) {
  return withAuth(async (user) => {
    const { id } = await params;
    const body = await request.json();
    const toStatus = body.status as ServiceOrderStatus;
    const note = body.note?.trim();

    if (!VALID.includes(toStatus)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    if (toStatus === "CANCELLED" && user.role === "OPERATOR") {
      return NextResponse.json({ error: "Sem permissão para cancelar" }, { status: 403 });
    }

    try {
      const order = await changeServiceOrderStatus(user.companyId, id, user.id, toStatus, note);
      return NextResponse.json(order);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar status";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  });
}
