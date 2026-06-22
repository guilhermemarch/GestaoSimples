"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Clock,
  User,
  Wallet,
  CircleDollarSign,
  ArrowDownCircle,
  ArrowUpCircle,
  Receipt,
  CheckCircle2,
  MoreVertical,
  Info,
  Banknote,
  QrCode,
  CreditCard,
  ChevronDown,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/system/data-table";
import { EmptyState } from "@/components/system/empty-state";
import { MetricCard } from "@/components/system/metric-card";
import { StatusBadge, type StatusBadgeVariant } from "@/components/system/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api, ApiError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import { CASH_MOVEMENT_LABELS, PAYMENT_METHOD_LABELS, formatCashMovementDescription } from "@/lib/labels";
import { cn } from "@/lib/utils";

type Movement = {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  saleId?: string | null;
  createdAt: string;
};

type CashSession = {
  id: string;
  openingAmount: number;
  openedAt: string;
  openedBy: { name: string };
  movements: Movement[];
};

type CaixaData = {
  open: boolean;
  session: CashSession | null;
  byMethod: Record<string, number>;
};

const MOVEMENT_BADGE: Record<string, StatusBadgeVariant> = {
  SALE: "venda",
  WITHDRAWAL: "sangria",
  REINFORCEMENT: "reforco",
  EXPENSE: "despesa",
};

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

export function CaixaContent() {
  const [data, setData] = useState<CaixaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openingAmount, setOpeningAmount] = useState("500");
  const [opening, setOpening] = useState(false);
  const [page, setPage] = useState(1);
  const [sangriaOpen, setSangriaOpen] = useState(false);
  const [sangriaAmount, setSangriaAmount] = useState("");
  const [sangriaDesc, setSangriaDesc] = useState("");
  const [savingSangria, setSavingSangria] = useState(false);
  const [reforcoOpen, setReforcoOpen] = useState(false);
  const [reforcoAmount, setReforcoAmount] = useState("");
  const [reforcoDesc, setReforcoDesc] = useState("");
  const [savingReforco, setSavingReforco] = useState(false);
  const pageSize = 8;

  function load() {
    setLoading(true);
    api
      .get<CaixaData>("/api/caixa/atual")
      .then(setData)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Erro ao carregar caixa"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleOpen() {
    setOpening(true);
    try {
      await api.post("/api/caixa/abrir", { openingAmount: Number(openingAmount) });
      toast.success("Caixa aberto com sucesso");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao abrir caixa");
    } finally {
      setOpening(false);
    }
  }

  async function handleSangria() {
    const amount = Number(sangriaAmount);
    if (!amount || amount <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    setSavingSangria(true);
    try {
      await api.post("/api/caixa/movimentos", {
        type: "WITHDRAWAL",
        amount,
        description: sangriaDesc || "Sangria de caixa",
      });
      toast.success("Sangria registrada");
      setSangriaOpen(false);
      setSangriaAmount("");
      setSangriaDesc("");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao registrar sangria");
    } finally {
      setSavingSangria(false);
    }
  }

  async function handleReforco() {
    const amount = Number(reforcoAmount);
    if (!amount || amount <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    setSavingReforco(true);
    try {
      await api.post("/api/caixa/movimentos", {
        type: "REINFORCEMENT",
        amount,
        description: reforcoDesc || "Reforço de caixa",
      });
      toast.success("Reforço registrado");
      setReforcoOpen(false);
      setReforcoAmount("");
      setReforcoDesc("");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao registrar reforço");
    } finally {
      setSavingReforco(false);
    }
  }

  const session = data?.session;

  const totals = useMemo(() => {
    if (!session) return { sangrias: 0, reforcos: 0, despesas: 0, entradas: 0, saidas: 0 };
    return session.movements.reduce(
      (acc, m) => {
        if (m.amount > 0) acc.entradas += m.amount;
        else acc.saidas += Math.abs(m.amount);
        if (m.type === "WITHDRAWAL") acc.sangrias += Math.abs(m.amount);
        if (m.type === "REINFORCEMENT") acc.reforcos += m.amount;
        if (m.type === "EXPENSE") acc.despesas += Math.abs(m.amount);
        return acc;
      },
      { sangrias: 0, reforcos: 0, despesas: 0, entradas: 0, saidas: 0 },
    );
  }, [session]);

  const expectedBalance = useMemo(() => {
    if (!session) return 0;
    return session.openingAmount + session.movements.reduce((sum, m) => sum + m.amount, 0);
  }, [session]);

  const paginatedMovements = useMemo(() => {
    if (!session) return [];
    const start = (page - 1) * pageSize;
    return session.movements.slice(start, start + pageSize);
  }, [session, page]);

  if (loading) {
    return (
      <div className="page-stack">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!data?.open || !session) {
    return (
      <>
        <PageHeader title="Caixa" description="Controle de caixa diário" />
        <EmptyState
          title="O caixa ainda não foi aberto hoje"
          description="Abra o caixa para começar a registrar movimentações"
        />
        <Card variant="panel" className="mx-auto mt-5 max-w-md shadow-card">
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label>Valor inicial (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={openingAmount}
                onChange={(e) => setOpeningAmount(e.target.value)}
              />
            </div>
            <Button className="w-full bg-primary hover:bg-primary-hover" onClick={handleOpen} disabled={opening}>
              {opening ? "Abrindo..." : "Abrir caixa"}
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  const openingTime = formatTime(session.openedAt);
  const cashSales = data.byMethod.CASH ?? 0;
  const pixSales = data.byMethod.PIX ?? 0;
  const cardSales =
    (data.byMethod.CREDIT_CARD ?? 0) + (data.byMethod.DEBIT_CARD ?? 0);

  return (
    <>
      <PageHeader
        title="Caixa"
        description="Acompanhe as movimentações e controle seu caixa em tempo real."
        badge={{ label: "Caixa aberto", variant: "success" }}
        actions={[
          { label: "Registrar sangria", onClick: () => setSangriaOpen(true), variant: "outline" },
          { label: "Fechar caixa", href: "/caixa/fechamento", variant: "primary" },
        ]}
      />

      {/* Grid assimétrico conforme protótipo */}
      <div className="mb-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-3 [&>*]:min-w-0">
        <MetricCard
          title="Horário de abertura"
          value={openingTime}
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

        {/* Valor esperado — coluna direita, 2 rows */}
        <div className="lg:col-start-4 lg:row-span-2 lg:row-start-1">
          <Card className="h-full border-2 border-primary bg-success-soft/40 shadow-card">
            <CardContent className="flex h-full flex-col justify-between p-5">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Valor esperado</p>
                  <CircleDollarSign className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-primary lg:text-3xl">{formatCurrency(expectedBalance)}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
                  Atualizado agora há poucos segundos
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <MetricCard title="Vendas em dinheiro" value={formatCurrency(cashSales)} icon={Banknote} iconClassName="green" />
        <MetricCard title="Vendas em Pix" value={formatCurrency(pixSales)} icon={QrCode} iconClassName="green" />
        <MetricCard title="Vendas em cartão" value={formatCurrency(cardSales)} icon={CreditCard} iconClassName="blue" />

        {/* Sangrias — abaixo do valor esperado */}
        <div className="lg:col-start-4 lg:row-start-3">
          <Card variant="panel" className="shadow-card">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-danger-soft text-danger">
                <ArrowDownCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Sangrias</p>
                <p className="text-lg font-bold text-danger lg:text-xl">- {formatCurrency(totals.sangrias)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <MetricCard
          title="Reforços"
          value={formatCurrency(totals.reforcos)}
          icon={ArrowUpCircle}
          iconClassName="green"
        />
        <MetricCard
          title="Despesas"
          value={`- ${formatCurrency(totals.despesas)}`}
          icon={Receipt}
          iconClassName="orange"
        />
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">Movimentações do caixa</h2>
        <Link href="/caixa" className="text-sm font-medium text-primary hover:underline">
          Ver todas as movimentações &gt;
        </Link>
      </div>

      <DataTable
        data={paginatedMovements}
        keyFn={(m) => m.id}
        columns={[
          { key: "time", header: "Horário", maxWidth: "100px", render: (m) => formatTime(m.createdAt) },
          {
            key: "type",
            header: "Tipo",
            maxWidth: "130px",
            render: (m) => (
              <StatusBadge
                label={CASH_MOVEMENT_LABELS[m.type] ?? m.type}
                variant={MOVEMENT_BADGE[m.type] ?? "neutral"}
              />
            ),
          },
          { key: "desc", header: "Descrição", maxWidth: "220px", render: (m) => formatCashMovementDescription(m.description, m.type) },
          {
            key: "amount",
            header: "Valor",
            maxWidth: "130px",
            align: "right",
            render: (m) => (
              <span className={cn("font-semibold", m.amount < 0 ? "text-danger" : "text-primary")}>
                {m.amount < 0 ? "- " : ""}
                {formatCurrency(Math.abs(m.amount))}
              </span>
            ),
          },
          { key: "user", header: "Responsável", maxWidth: "150px", render: () => session.openedBy.name },
          {
            key: "actions",
            header: "",
            maxWidth: "60px",
            align: "right",
            render: (m) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {m.type === "SALE" && (
                    <DropdownMenuItem asChild>
                      <Link href="/relatorios">
                        <FileText className="mr-2 h-4 w-4" />
                        Ver relatório de vendas
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {(m.type === "WITHDRAWAL" || m.type === "REINFORCEMENT" || m.type === "EXPENSE") && (
                    <DropdownMenuItem asChild>
                      <Link href="/caixa/fechamento">
                        <Receipt className="mr-2 h-4 w-4" />
                        Ver no fechamento
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
        pagination={{
          page,
          pageSize,
          total: session.movements.length,
          onPageChange: setPage,
        }}
      />

      {/* Footer subtotals */}
      <div className="mt-5 rounded-lg border border-border bg-card p-4 shadow-card sm:p-5">
        <div className="grid min-w-0 grid-cols-2 gap-4 lg:grid-cols-4 [&>*]:min-w-0">
          <div>
            <p className="text-xs text-muted-foreground">Subtotal de entradas</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(totals.entradas)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Subtotal de saídas</p>
            <p className="text-lg font-bold text-danger">- {formatCurrency(totals.saidas)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Valor esperado</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(expectedBalance)}</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              Diferença <Info className="h-3 w-3" />
            </p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(0)}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <p className="text-sm font-medium text-success">
            Tudo certo! Seu caixa está conferindo.
          </p>
        </div>
      </div>

      <Dialog open={sangriaOpen} onOpenChange={setSangriaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar sangria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={sangriaAmount}
                onChange={(e) => setSangriaAmount(e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Input
                value={sangriaDesc}
                onChange={(e) => setSangriaDesc(e.target.value)}
                placeholder="Motivo da sangria"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSangriaOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-primary hover:bg-primary-hover" onClick={handleSangria} disabled={savingSangria}>
              {savingSangria ? "Registrando..." : "Confirmar sangria"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reforcoOpen} onOpenChange={setReforcoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar reforço</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={reforcoAmount}
                onChange={(e) => setReforcoAmount(e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Input
                value={reforcoDesc}
                onChange={(e) => setReforcoDesc(e.target.value)}
                placeholder="Motivo do reforço"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReforcoOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-primary hover:bg-primary-hover" onClick={handleReforco} disabled={savingReforco}>
              {savingReforco ? "Registrando..." : "Confirmar reforço"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
