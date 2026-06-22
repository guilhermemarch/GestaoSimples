"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Clock,
  Info,
  ShoppingBag,
  User,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { AlertBanner } from "@/components/system/alert-banner";
import { MetricCard } from "@/components/system/metric-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, ApiError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import { PAYMENT_METHOD_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

type CaixaData = {
  open: boolean;
  session: {
    openingAmount: number;
    openedAt: string;
    openedBy: { name: string };
    salesCount: number;
    movements: { type: string; amount: number }[];
  } | null;
  byMethod: Record<string, number>;
};

const CHECKLIST = [
  "Confira os valores registrados por forma de pagamento",
  "Conte o dinheiro físico e informe o valor contado",
  "Se houver diferença, descreva a justificativa antes de confirmar",
];

const MAX_JUSTIFICATION = 500;

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

function formatDateShort(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const dateStr = d.toLocaleDateString("pt-BR");
  return isToday ? `Hoje, ${dateStr}` : dateStr;
}

export function FechamentoContent() {
  const router = useRouter();
  const [data, setData] = useState<CaixaData | null>(null);
  const [closingAmount, setClosingAmount] = useState("");
  const [justification, setJustification] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [countedByMethod, setCountedByMethod] = useState<Record<string, string>>({});

  useEffect(() => {
    api
      .get<CaixaData>("/api/caixa/atual")
      .then((res) => {
        setData(res);
        if (res.session) {
          const expected =
            res.session.openingAmount +
            res.session.movements.reduce((sum, m) => sum + m.amount, 0);
          setClosingAmount(expected.toFixed(2));
        }
        if (res.byMethod) {
          const initial = Object.fromEntries(
            Object.entries(res.byMethod)
              .filter(([, v]) => v > 0)
              .map(([k, v]) => [k, v.toFixed(2)]),
          );
          setCountedByMethod(initial);
        }
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Erro ao carregar caixa"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const cashCounted = countedByMethod.CASH;
    if (cashCounted !== undefined && cashCounted !== "") {
      setClosingAmount(Number(cashCounted).toFixed(2));
    }
  }, [countedByMethod]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/api/caixa/fechar", {
        closingAmount: Number(closingAmount),
        justification: justification || null,
      });
      toast.success("Caixa fechado com sucesso");
      router.push("/caixa");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao fechar caixa");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="page-stack">
        <div className="h-8 w-56 animate-pulse rounded bg-muted" />
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!data?.open || !data.session) {
    return (
      <PageHeader
        title="Fechamento de caixa"
       
        description="Nenhum caixa aberto no momento"
        actions={[{ label: "Voltar", href: "/caixa" }]}
      />
    );
  }

  const session = data.session;
  const expected =
    session.openingAmount + session.movements.reduce((sum, m) => sum + m.amount, 0);
  const difference = Number(closingAmount) - expected;
  const needsJustification = difference !== 0;

  const sangrias = session.movements
    .filter((m) => m.type === "WITHDRAWAL")
    .reduce((sum, m) => sum + Math.abs(m.amount), 0);
  const reforcos = session.movements
    .filter((m) => m.type === "REINFORCEMENT")
    .reduce((sum, m) => sum + m.amount, 0);
  const despesas = session.movements
    .filter((m) => m.type === "EXPENSE")
    .reduce((sum, m) => sum + Math.abs(m.amount), 0);

  const totalSales = Object.values(data.byMethod ?? {}).reduce((sum, v) => sum + v, 0);
  const entradas = session.openingAmount + totalSales + reforcos;
  const saidas = sangrias + despesas;
  const countedTotal = Number(closingAmount);
  const differencePct =
    expected !== 0 ? ((difference / Math.abs(expected)) * 100).toFixed(1) : "0,0";

  const methods = Object.entries(data.byMethod ?? {}).filter(([, v]) => v > 0);

  const movementRows = [
    { label: "Sangrias", registered: sangrias, isOutflow: true },
    { label: "Reforços", registered: reforcos, isOutflow: false },
    { label: "Despesas", registered: despesas, isOutflow: true },
  ];

  return (
    <>
      <PageHeader
        title="Fechamento de caixa"
       
        description="Confira todos os valores e confirme o fechamento do caixa do dia."
        actions={[{ label: "Voltar", href: "/caixa", variant: "outline" }]}
      />

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6 [&>*]:min-w-0">
        <div className="space-y-4 lg:col-span-2">
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
            <MetricCard
              title="Horário de abertura"
              value={formatTime(session.openedAt)}
              subtitle={formatDateShort(session.openedAt)}
              icon={Clock}
              iconClassName="green"
            />
            <MetricCard
              title="Responsável"
              value={session.openedBy.name}
              subtitle="Operador(a)"
              icon={User}
              iconClassName="green"
            />
            <MetricCard
              title="Valor inicial"
              value={formatCurrency(session.openingAmount)}
              icon={Wallet}
              iconClassName="green"
            />
            <MetricCard
              title="Total de vendas"
              value={String(session.salesCount)}
              subtitle={formatCurrency(totalSales)}
              icon={ShoppingBag}
              iconClassName="blue"
            />
          </div>

          <Card variant="panel" className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Conciliação por forma de pagamento</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Forma</TableHead>
                    <TableHead className="text-right">Registrado</TableHead>
                    <TableHead className="text-right">Contado</TableHead>
                    <TableHead className="text-right">Diferença</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {methods.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Nenhuma venda registrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    methods.map(([method, total]) => {
                      const counted = Number(countedByMethod[method] ?? total);
                      const diff = counted - total;
                      return (
                        <TableRow key={method}>
                          <TableCell>{PAYMENT_METHOD_LABELS[method] ?? method}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(total)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.01"
                              className="ml-auto h-8 w-full min-w-[96px] text-right sm:w-28"
                              value={countedByMethod[method] ?? ""}
                              onChange={(e) =>
                                setCountedByMethod((prev) => ({ ...prev, [method]: e.target.value }))
                              }
                            />
                          </TableCell>
                          <TableCell
                            className={cn(
                              "text-right",
                              diff !== 0 ? "text-warning" : "text-success",
                            )}
                          >
                            {formatCurrency(diff)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                  {movementRows.map((row) => (
                    <TableRow key={row.label} className="bg-muted/20">
                      <TableCell className="font-medium">{row.label}</TableCell>
                      <TableCell className="text-right font-medium">
                        {row.isOutflow ? `-${formatCurrency(row.registered)}` : formatCurrency(row.registered)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">—</TableCell>
                      <TableCell className="text-right text-success">{formatCurrency(0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card variant="panel" className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Resumo final</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 [&>*]:min-w-0">
                {[
                  { label: "Entradas", value: entradas, highlight: false },
                  { label: "Saídas", value: saidas, highlight: false, isOutflow: true },
                  { label: "Valor esperado total", value: expected, highlight: true },
                  { label: "Valor contado total", value: countedTotal, highlight: false },
                  {
                    label: "Diferença final",
                    value: difference,
                    highlight: difference !== 0,
                    suffix: ` (${difference >= 0 ? "+" : ""}${differencePct}%)`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      "min-w-0 rounded-lg border border-border p-3 text-center",
                      item.highlight ? "border-warning/20 bg-warning-soft/50" : "bg-muted/20",
                    )}
                  >
                    <p className="truncate text-xs text-muted-foreground">{item.label}</p>
                    <p
                      className={cn(
                        "mt-1 text-sm font-bold",
                        item.label === "Diferença final" && difference !== 0 && "text-warning",
                      )}
                    >
                      {item.isOutflow ? "-" : ""}
                      {formatCurrency(Math.abs(item.value))}
                      {item.suffix && (
                        <span className="block text-xs font-medium text-muted-foreground">
                          {item.suffix.trim()}
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Valor contado em caixa *</Label>
              <Input
                type="number"
                step="0.01"
                value={closingAmount}
                onChange={(e) => setClosingAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Justificativa {needsJustification ? "*" : "(opcional)"}</Label>
                <span className="text-xs text-muted-foreground">
                  {justification.length} / {MAX_JUSTIFICATION} caracteres
                </span>
              </div>
              <Textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Descreva o motivo da diferença, se houver"
                rows={4}
                maxLength={MAX_JUSTIFICATION}
              />
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <AlertBanner
            variant="warning"
            icon={AlertTriangle}
            title="Atenção!"
            description={
              difference !== 0
                ? `O fechamento é irreversível. Diferença de ${formatCurrency(difference)} entre o valor contado e o esperado.`
                : "O fechamento de caixa é irreversível. Confira todos os valores antes de confirmar."
            }
          />

          <Card variant="panel" className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Checklist de fechamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {CHECKLIST.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-lg border border-border bg-muted/10 p-3 text-sm"
                >
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button
              type="button"
              className="w-full bg-primary hover:bg-primary-hover"
              disabled={saving || (needsJustification && !justification.trim())}
              onClick={(e) => {
                e.preventDefault();
                void handleSubmit(e as unknown as React.FormEvent);
              }}
            >
              {saving ? "Fechando..." : "Confirmar fechamento"}
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => router.push("/caixa")}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
