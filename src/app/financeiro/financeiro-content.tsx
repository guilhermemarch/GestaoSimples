"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, ApiError } from "@/lib/api-client";
import { DespesasTab, type DespesasResumoData } from "./tabs/despesas-tab";
import { ReceberTab, type ReceberData } from "./tabs/receber-tab";
import { ResultadoTab, type ResultadoData } from "./tabs/resultado-tab";

export function FinanceiroContent() {
  const [tab, setTab] = useState("receber");
  const [receberData, setReceberData] = useState<ReceberData | null>(null);
  const [despesasData, setDespesasData] = useState<DespesasResumoData | null>(null);
  const [resultadoData, setResultadoData] = useState<ResultadoData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get<ReceberData>("/api/financeiro/receber"),
      api.get<DespesasResumoData>("/api/financeiro/despesas-resumo"),
      api.get<ResultadoData>("/api/financeiro/resultado"),
    ])
      .then(([rec, desp, res]) => {
        setReceberData(rec);
        setDespesasData(desp);
        setResultadoData(res);
      })
      .catch((err) =>
        toast.error(err instanceof ApiError ? err.message : "Erro ao carregar financeiro"),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="page-stack">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-2 [&>*]:min-w-0">
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  if (!receberData || !despesasData || !resultadoData) {
    return <p className="text-muted-foreground">Não foi possível carregar os dados financeiros.</p>;
  }

  return (
    <>
      <PageHeader
        title="Financeiro"
        description="Controle de recebimentos, despesas e resultado do mês."
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList variant="line" className="mb-5 w-full justify-start overflow-x-auto border-b">
          <TabsTrigger value="receber" className="shrink-0 whitespace-nowrap">
            Contas a receber
          </TabsTrigger>
          <TabsTrigger value="despesas" className="shrink-0 whitespace-nowrap">
            Despesas
          </TabsTrigger>
          <TabsTrigger value="resultado" className="shrink-0 whitespace-nowrap">
            Resultado do mês
          </TabsTrigger>
        </TabsList>

        <TabsContent value="receber" className="mt-0">
          <ReceberTab data={receberData} onRefresh={load} />
        </TabsContent>

        <TabsContent value="despesas" className="mt-0">
          <DespesasTab data={despesasData} onRefresh={load} />
        </TabsContent>

        <TabsContent value="resultado" className="mt-0">
          <ResultadoTab data={resultadoData} />
        </TabsContent>
      </Tabs>
    </>
  );
}
