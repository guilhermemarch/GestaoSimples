import { AppShell } from "@/components/AppShell";
import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

async function getStats() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [salesToday, salesMonth, customerCount, productCount] = await Promise.all([
    prisma.sale.aggregate({
      where: { createdAt: { gte: startOfDay } },
      _sum: { total: true },
    }),
    prisma.sale.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { total: true },
    }),
    prisma.customer.count(),
    prisma.product.count(),
  ]);

  return {
    salesToday: salesToday._sum.total ?? 0,
    salesMonth: salesMonth._sum.total ?? 0,
    customerCount,
    productCount,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Vendas hoje", value: formatCurrency(stats.salesToday), color: "blue" },
    { label: "Vendas no mês", value: formatCurrency(stats.salesMonth), color: "green" },
    { label: "Clientes", value: String(stats.customerCount), color: "purple" },
    { label: "Produtos", value: String(stats.productCount), color: "orange" },
  ];

  return (
    <AppShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
