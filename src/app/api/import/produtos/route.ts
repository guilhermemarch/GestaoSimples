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
      const price = Number(row.preco || row.price);
      const stock = Number(row.estoque || row.stock || 0);

      if (!name) {
        errors.push({ line, error: "Nome é obrigatório" });
        continue;
      }
      if (!price || price <= 0) {
        errors.push({ line, error: "Preço inválido" });
        continue;
      }

      try {
        const product = await prisma.product.create({
          data: {
            companyId: user.companyId,
            name,
            sku: row.sku || null,
            price,
            stock: Number.isNaN(stock) ? 0 : stock,
            minStock: Number(row.estoqueminimo || row.minstock) || 5,
          },
        });
        created.push(product);
      } catch {
        errors.push({ line, error: "Erro ao criar produto" });
      }
    }

    return NextResponse.json({
      imported: created.length,
      errors,
      products: created,
    });
  });
}
