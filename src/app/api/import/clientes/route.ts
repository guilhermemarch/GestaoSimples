import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";
import { csvRowsToObjects, parseCsv } from "@/lib/csv";

export async function POST(request: Request) {
  return withAuth(async (user) => {
    const body = await request.json();
    const csvText = body.csv as string;

    if (!csvText?.trim()) {
      return NextResponse.json({ error: "Conteúdo CSV é obrigatório" }, { status: 400 });
    }

    const { records } = csvRowsToObjects(parseCsv(csvText));
    const created: unknown[] = [];
    const errors: { line: number; error: string }[] = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const line = i + 2;
      const name = row.nome || row.name;
      if (!name) {
        errors.push({ line, error: "Nome é obrigatório" });
        continue;
      }
      try {
        const customer = await prisma.customer.create({
          data: {
            companyId: user.companyId,
            name,
            phone: row.telefone || row.phone || null,
            email: row.email || null,
            document: row.documento || row.document || null,
            address: row.endereco || row.address || null,
          },
        });
        created.push(customer);
      } catch {
        errors.push({ line, error: "Erro ao criar cliente" });
      }
    }

    return NextResponse.json({
      imported: created.length,
      errors,
      customers: created,
    });
  });
}
