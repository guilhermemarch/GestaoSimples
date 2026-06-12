import { hash } from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const adminHash = await hash("admin123", 10);
  const operatorHash = await hash("operador123", 10);

  await prisma.user.upsert({
    where: { email: "admin@gestao.com" },
    update: {},
    create: {
      email: "admin@gestao.com",
      passwordHash: adminHash,
      name: "Administrador",
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "operador@gestao.com" },
    update: {},
    create: {
      email: "operador@gestao.com",
      passwordHash: operatorHash,
      name: "Operador",
      role: "OPERATOR",
    },
  });

  const customerCount = await prisma.customer.count();
  if (customerCount === 0) {
    await prisma.customer.createMany({
      data: [
        { name: "Maria Silva", phone: "(11) 99999-0001", email: "maria@email.com" },
        { name: "João Santos", phone: "(11) 99999-0002" },
      ],
    });
  }

  const productCount = await prisma.product.count();
  if (productCount === 0) {
    await prisma.product.createMany({
      data: [
        { name: "Caderno", price: 12.5, stock: 50 },
        { name: "Caneta", price: 3.0, stock: 100 },
        { name: "Borracha", price: 2.5, stock: 80 },
      ],
    });
  }

  console.log("Seed concluído.");
  console.log("Admin: admin@gestao.com / admin123");
  console.log("Operador: operador@gestao.com / operador123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
