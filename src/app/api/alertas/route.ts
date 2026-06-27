import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { getAlerts } from "@/lib/alerts";

export async function GET() {
  return withAuth(async (user) => {
    const alerts = await getAlerts(user.companyId);
    return NextResponse.json({ alerts, count: alerts.length });
  });
}
