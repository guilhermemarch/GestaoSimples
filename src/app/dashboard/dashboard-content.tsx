"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  Clock,
  Ticket,
  AlertTriangle,
  Calendar,
  Wallet,
  FileText,
  ShoppingCart,
  UserPlus,
  Package,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/system/metric-card";
import { ActionCard } from "@/components/system/action-card";
import { ProductThumbnail } from "@/components/system/avatar";
import { LineChartCard } from "@/components/charts/line-chart-card";
import { DonutChartCard } from "@/components/charts/donut-chart-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, ApiError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import { donutPalette, chartColors } from "@/components/charts/chart-tokens";

const DONUT_COLORS = donutPalette;

type DashboardData = {
  salesToday: number;
  salesCountToday: number;
  averageTicketToday: number;
  lowStockCount: number;
  cashOpen: boolean;
  cashOpenedAt?: string | null;
  receivedToday?: number;
  pendingToday?: number;
  quoteExpiringCount?: number;
  overdueReceivablesCount?: number;
  topProducts?: { productId: string; name: string; imageUrl?: string | null; quantity: number }[];
  salesLast7Days?: { label: string; value: number }[];
  paymentMethodsToday?: { name: string; value: number }[];
  paymentMethodsMonth?: { name: string; value: number }[];
  trends?: {
    salesToday?: string;
    receivedToday?: string;
    pendingToday?: string;
    averageTicket?: string;
  };
};

type Props = { userName?: string };

function trendDir(trend?: string): "up" | "down" | "neutral" {
  if (!trend) return "neutral";
  if (trend.startsWith("-")) return "down";
  if (trend.startsWith("+")) return "up";
  return "neutral";
}

function formatCashSince(iso?: string | null) {
  if (!iso) return "Desde 08:00";
  const d = new Date(iso);
  return `Desde ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

export function DashboardContent({ userName = "Ana" }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [salesPeriod, setSalesPeriod] = useState("7d");
  const [paymentPeriod, setPaymentPeriod] = useState("today");

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<DashboardData>(
        `/api/dashboard?salesPeriod=${salesPeriod}&paymentPeriod=${paymentPeriod}`,
      )
      .then(setData)
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : "Erro ao carregar dashboard");
      })
      .finally(() => setLoading(false));
  }, [salesPeriod, paymentPeriod]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !data) return <p className="text-muted-foreground">Carregando dashboard...</p>;
  if (!data) return <p className="text-muted-foreground">Não foi possível carregar os dados.</p>;

  const receivedToday = data.receivedToday ?? data.salesToday;
  const pendingToday = data.pendingToday ?? 0;
  const quoteCount = data.quoteExpiringCount ?? 0;

  const paymentSource =
    paymentPeriod === "month" ? data.paymentMethodsMonth : data.paymentMethodsToday;
  const paymentDonut = (paymentSource ?? []).map((m, i) => ({
    name: m.name,
    value: m.value,
    color: DONUT_COLORS[i % DONUT_COLORS.length],
  }));

  const salesChart = data.salesLast7Days ?? [];

  return (
    <>
      <PageHeader
        title={`Bem-vinda, ${userName}!`}
        description="Veja o resumo do seu negócio e acompanhe o que mais importa hoje."
        badge={data.cashOpen ? { label: "Caixa aberto", variant: "success" } : undefined}
        badgePosition="end"
      />

      <div className="mb-5 grid min-w-0 grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0 [&>*]:h-full">
        <MetricCard
          title="Vendas hoje"
          value={formatCurrency(data.salesToday)}
          subtitle={`${data.salesCountToday} vendas realizadas`}
          trend={data.trends?.salesToday}
          trendDirection={trendDir(data.trends?.salesToday)}
          icon={TrendingUp}
          iconClassName="green"
        />
        <MetricCard
          title="Recebido hoje"
          value={formatCurrency(receivedToday)}
          trend={data.trends?.receivedToday}
          trendDirection={trendDir(data.trends?.receivedToday)}
          icon={DollarSign}
          iconClassName="green"
        />
        <MetricCard
          title="Pendente"
          value={formatCurrency(pendingToday)}
          trend={data.trends?.pendingToday}
          trendDirection={trendDir(data.trends?.pendingToday)}
          icon={Clock}
          iconClassName="orange"
        />
        <MetricCard
          title="Ticket médio"
          value={formatCurrency(data.averageTicketToday)}
          trend={data.trends?.averageTicket}
          trendDirection={trendDir(data.trends?.averageTicket)}
          icon={Ticket}
          iconClassName="green"
        />
      </div>

      <div className="mb-5 grid min-w-0 grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0 [&>*]:h-full">
        <ActionCard
          label="Estoque baixo"
          value={`${data.lowStockCount} produtos`}
          icon={AlertTriangle}
          href="/estoque"
          linkLabel="Ver produtos >"
          iconClassName="text-warning"
        />
        <ActionCard
          label="Contas vencidas"
          value={`${data.overdueReceivablesCount ?? 0} contas`}
          icon={Calendar}
          href="/financeiro/contas-a-receber"
          linkLabel="Ver contas >"
          iconClassName="text-danger"
        />
        <ActionCard
          label="Caixa"
          value={data.cashOpen ? "Aberto" : "Fechado"}
          subtitle={data.cashOpen ? formatCashSince(data.cashOpenedAt) : undefined}
          icon={Wallet}
          href="/caixa"
          linkLabel="Ver detalhes >"
          iconClassName="text-primary"
        />
        <ActionCard
          label="Orçamentos vencendo"
          value={quoteCount > 0 ? `${quoteCount} esta semana` : "Nenhum"}
          icon={FileText}
          href="/servicos"
          linkLabel="Ver orçamentos >"
          iconClassName="text-warning"
        />
      </div>

      <div className="mb-5 grid min-w-0 grid-cols-1 items-stretch gap-3 lg:grid-cols-3 [&>*]:min-w-0 [&>*]:h-full">
        <div className="min-w-0 lg:col-span-1">
          <LineChartCard
            title={salesPeriod === "30d" ? "Vendas dos últimos 30 dias" : "Vendas dos últimos 7 dias"}
            data={salesChart}
            period={salesPeriod}
            onPeriodChange={setSalesPeriod}
            periodOptions={[
              { value: "7d", label: "Últimos 7 dias" },
              { value: "30d", label: "Últimos 30 dias" },
            ]}
          />
        </div>
        <div className="min-w-0 lg:col-span-1">
          <DonutChartCard
            title="Formas de pagamento"
            data={paymentDonut.length > 0 ? paymentDonut : [{ name: "Sem vendas", value: 1, color: chartColors.empty }]}
            centerValue={formatCurrency(
              paymentDonut.reduce((s, d) => s + d.value, 0) || data.salesToday,
            )}
            centerLabel="Total"
            period={paymentPeriod}
            onPeriodChange={setPaymentPeriod}
            periodOptions={[
              { value: "today", label: "Hoje" },
              { value: "month", label: "Este mês" },
            ]}
            footerLink={{ label: "Ver relatório completo", href: "/relatorios" }}
          />
        </div>
        <Card variant="panel" className="flex h-full min-w-0 flex-col shadow-card lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold">Produtos mais vendidos</CardTitle>
            <Select defaultValue="today">
              <SelectTrigger className="h-8 w-[90px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Semana</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            {(data.topProducts ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma venda registrada ainda</p>
            ) : (
              <ul className="space-y-2">
                {data.topProducts!.map((p, i) => (
                  <li key={p.productId} className="flex items-center gap-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <ProductThumbnail
                      name={p.name}
                      index={p.productId.charCodeAt(0)}
                      imageUrl={p.imageUrl}
                      size="sm"
                    />
                    <span className="min-w-0 flex-1 truncate">{p.name}</span>
                    <span className="shrink-0 font-medium text-muted-foreground">{p.quantity} un.</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/produtos" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
              Ver todos os produtos
            </Link>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Ações rápidas</h3>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Nova venda", icon: ShoppingCart, href: "/vendas/nova" },
            { label: "Novo cliente", icon: UserPlus, href: "/clientes" },
            { label: "Novo produto", icon: Package, href: "/produtos" },
            { label: "Fechar caixa", icon: Wallet, href: "/caixa/fechamento" },
            { label: "Registrar despesa", icon: Receipt, href: "/financeiro/despesas" },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex h-full min-h-[52px] items-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent">
                <action.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
