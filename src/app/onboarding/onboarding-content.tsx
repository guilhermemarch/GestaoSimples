"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Store,
  Briefcase,
  Wrench,
  UtensilsCrossed,
  MoreHorizontal,
} from "lucide-react";
import { BrandLogo } from "@/components/system/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { api, ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const STEPS = [
  "Dados da empresa",
  "Segmento",
  "Produtos iniciais",
  "Usuários",
  "Dashboard",
];

const SEGMENTS = [
  { id: "loja", label: "Loja ou comércio", desc: "Varejo, loja física ou online", icon: Store },
  { id: "servicos", label: "Serviços", desc: "Prestação de serviços gerais", icon: Briefcase },
  { id: "oficina", label: "Oficina ou assistência", desc: "Reparos e manutenção", icon: Wrench },
  { id: "alimentacao", label: "Alimentação", desc: "Restaurante, padaria, bar", icon: UtensilsCrossed },
  { id: "outro", label: "Outro", desc: "Outro tipo de negócio", icon: MoreHorizontal },
];

type Company = {
  name: string;
  tradeName: string | null;
  document: string | null;
  phone: string | null;
  address: string | null;
  segment: string | null;
};

export function OnboardingContent() {
  const router = useRouter();
  const [step, setStep] = useState(2);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState("");
  const [productDraft, setProductDraft] = useState({ name: "", price: "" });
  const [productList, setProductList] = useState<{ name: string; price: string }[]>([]);
  const [userDraft, setUserDraft] = useState({ name: "", email: "", role: "OPERATOR" });
  const [userList, setUserList] = useState<{ name: string; email: string; role: string }[]>([]);
  const [form, setForm] = useState<Company>({
    name: "",
    tradeName: "",
    document: "",
    phone: "",
    address: "",
    segment: "",
  });

  useEffect(() => {
    api
      .get<Company>("/api/company")
      .then((data) => {
        setForm({
          name: data.name ?? "",
          tradeName: data.tradeName ?? "",
          document: data.document ?? "",
          phone: data.phone ?? "",
          address: data.address ?? "",
          segment: data.segment ?? "",
        });
        if (data.segment) setSelectedSegment(data.segment);
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Erro ao carregar"))
      .finally(() => setLoading(false));
  }, []);

  function update(field: keyof Company, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleFinish() {
    setSaving(true);
    try {
      const segmentLabel = SEGMENTS.find((s) => s.id === selectedSegment)?.label ?? selectedSegment;
      await api.put("/api/company", { ...form, segment: segmentLabel });

      for (const p of productList) {
        const price = parseFloat(p.price.replace(",", "."));
        if (p.name && price > 0) {
          await api.post("/api/products", { name: p.name, price, stock: 10, minStock: 5 });
        }
      }

      for (const u of userList) {
        if (u.name && u.email) {
          try {
            await api.post("/api/users", {
              name: u.name,
              email: u.email,
              password: "operador123",
              role: u.role,
            });
          } catch {
            // skip duplicate emails silently
          }
        }
      }

      toast.success("Empresa configurada com sucesso!");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  function addProduct() {
    if (!productDraft.name.trim()) return;
    setProductList((prev) => [...prev, { ...productDraft }]);
    setProductDraft({ name: "", price: "" });
  }

  function addUser() {
    if (!userDraft.name.trim() || !userDraft.email.trim()) return;
    setUserList((prev) => [...prev, { ...userDraft }]);
    setUserDraft({ name: "", email: "", role: "OPERATOR" });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <BrandLogo size="md" />
      </div>

      <Card className="w-full max-w-4xl border-border p-4 shadow-card sm:p-6 lg:p-8">
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="text-2xl font-bold">Vamos configurar sua empresa</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            É rápido e fácil. Você pode pular etapas e completar depois.
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8 flex items-center justify-center gap-0 sm:mb-10">
          {STEPS.map((label, i) => {
            const num = i + 1;
            const done = num < step;
            const active = num === step;
            return (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 sm:text-sm",
                      done || active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {done ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : num}
                  </div>
                  <span
                    className={cn(
                      "mt-1 hidden text-[10px] xs:block xs:text-[10px] sm:text-xs",
                      active ? "font-medium text-primary" : "text-muted-foreground",
                    )}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-1 h-0.5 w-6 sm:mx-2 sm:w-12 lg:w-20",
                      done ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-3 lg:gap-8">
          <div className="min-w-0 lg:col-span-2">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Dados da empresa</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Razão social *</Label>
                    <Input value={form.name} onChange={(e) => update("name", e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome fantasia</Label>
                    <Input value={form.tradeName ?? ""} onChange={(e) => update("tradeName", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>CNPJ/CPF</Label>
                    <Input value={form.document ?? ""} onChange={(e) => update("document", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input value={form.phone ?? ""} onChange={(e) => update("phone", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Segmento</Label>
                    <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o segmento" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEGMENTS.map((seg) => (
                          <SelectItem key={seg.id} value={seg.id}>
                            {seg.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Endereço</Label>
                    <Input value={form.address ?? ""} onChange={(e) => update("address", e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="mb-1 text-lg font-semibold">Qual tipo de negócio você gerencia?</h2>
                <p className="mb-4 text-sm text-muted-foreground">Selecione o segmento que melhor descreve sua empresa.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {SEGMENTS.filter((s) => s.id !== "outro").map((seg) => (
                    <button
                      key={seg.id}
                      type="button"
                      onClick={() => setSelectedSegment(seg.id)}
                      className={cn(
                        "relative flex items-start gap-3 rounded-lg border p-3 text-left transition-colors sm:p-4",
                        selectedSegment === seg.id
                          ? "border-primary border-2 bg-accent/30"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      {selectedSegment === seg.id && (
                        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent sm:h-10 sm:w-10">
                        <seg.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium">{seg.label}</p>
                        <p className="text-xs text-muted-foreground">{seg.desc}</p>
                      </div>
                    </button>
                  ))}
                  {SEGMENTS.filter((s) => s.id === "outro").map((seg) => (
                    <button
                      key={seg.id}
                      type="button"
                      onClick={() => setSelectedSegment(seg.id)}
                      className={cn(
                        "relative flex items-start gap-3 rounded-lg border p-3 text-left transition-colors sm:col-span-2 sm:p-4",
                        selectedSegment === seg.id
                          ? "border-primary border-2 bg-accent/30"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      {selectedSegment === seg.id && (
                        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent sm:h-10 sm:w-10">
                        <seg.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium">{seg.label}</p>
                        <p className="text-xs text-muted-foreground">{seg.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(step === 3 || step === 4 || step === 5) && (
              <div>
                {step === 3 && (
                  <>
                    <h2 className="mb-1 text-lg font-semibold">Produtos iniciais</h2>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Cadastre alguns produtos para começar a vender. Você pode pular e fazer isso depois.
                    </p>
                    <div className="space-y-3 rounded-lg border border-dashed border-border p-4 sm:p-6">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Nome do produto</Label>
                          <Input
                            placeholder="Ex: Camiseta básica"
                            value={productDraft.name}
                            onChange={(e) => setProductDraft((p) => ({ ...p, name: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Preço</Label>
                          <Input
                            placeholder="R$ 0,00"
                            value={productDraft.price}
                            onChange={(e) => setProductDraft((p) => ({ ...p, price: e.target.value }))}
                          />
                        </div>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={addProduct}>
                        Adicionar produto
                      </Button>
                      {productList.length > 0 && (
                        <ul className="space-y-2 border-t border-border pt-3">
                          {productList.map((p, i) => (
                            <li key={i} className="flex justify-between text-sm">
                              <span>{p.name}</span>
                              <span className="text-muted-foreground">R$ {p.price}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </>
                )}
                {step === 4 && (
                  <>
                    <h2 className="mb-1 text-lg font-semibold">Convide sua equipe</h2>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Adicione operadores e gerentes para ajudar no dia a dia.
                    </p>
                    <div className="space-y-3 rounded-lg border border-dashed border-border p-4 sm:p-6">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Nome</Label>
                          <Input
                            placeholder="Nome do usuário"
                            value={userDraft.name}
                            onChange={(e) => setUserDraft((u) => ({ ...u, name: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>E-mail</Label>
                          <Input
                            placeholder="email@empresa.com"
                            value={userDraft.email}
                            onChange={(e) => setUserDraft((u) => ({ ...u, email: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Perfil</Label>
                          <Select
                            value={userDraft.role}
                            onValueChange={(v) => setUserDraft((u) => ({ ...u, role: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="OPERATOR">Operador</SelectItem>
                              <SelectItem value="MANAGER">Gerente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={addUser}>
                        Adicionar usuário
                      </Button>
                      {userList.length > 0 && (
                        <ul className="space-y-2 border-t border-border pt-3">
                          {userList.map((u, i) => (
                            <li key={i} className="flex justify-between text-sm">
                              <span>{u.name}</span>
                              <span className="text-muted-foreground">{u.email}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </>
                )}
                {step === 5 && (
                  <>
                    <h2 className="mb-1 text-lg font-semibold">Tudo pronto!</h2>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Sua empresa está configurada. Acesse o dashboard para começar.
                    </p>
                    <div className="rounded-lg border border-primary/20 bg-accent/30 p-4 text-center sm:p-6">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 sm:h-14 sm:w-14">
                        <Check className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
                      </div>
                      <p className="font-medium">Configuração concluída</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Vendas, estoque, caixa e relatórios aguardam você.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Painel direito */}
          <div className="hidden border-l border-border pl-4 lg:block lg:pl-8">
            <div className="mb-6 overflow-hidden rounded-lg border border-border bg-card p-4 shadow-card">
              {step <= 2 && (
                <>
                  <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-md bg-accent/30">
                    <Image
                      src="/images/login-hero.png"
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 320px, 1px"
                    />
                  </div>
                  <h3 className="font-semibold">Comece com o pé direito</h3>
                </>
              )}
              {step === 3 && (
                <>
                  <h3 className="font-semibold">Dica</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Comece com 5–10 produtos mais vendidos. Você pode importar uma planilha depois.
                  </p>
                </>
              )}
              {step === 4 && (
                <>
                  <h3 className="font-semibold">Equipe</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Operadores podem registrar vendas e abrir caixa. Gerentes acessam relatórios financeiros.
                  </p>
                </>
              )}
              {step === 5 && (
                <>
                  <h3 className="font-semibold">Próximos passos</h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li>• Abrir o caixa do dia</li>
                    <li>• Registrar sua primeira venda</li>
                    <li>• Conferir o estoque</li>
                  </ul>
                </>
              )}
            </div>
            {step <= 2 && (
            <ul className="space-y-3">
              {[
                "Configuração rápida e guiada",
                "Dados seguros e protegidos",
                "Você pode alterar depois",
                "Tudo pronto em poucos minutos",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            )}
          </div>
        </div>

        {/* Footer nav */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 sm:mt-8 sm:pt-6">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <button
            type="button"
            onClick={() => (step < 5 ? setStep((s) => s + 1) : handleFinish())}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Pular etapa
          </button>
          <Button
            className="gap-2 bg-primary hover:bg-primary-hover"
            disabled={saving || (step === 1 && !form.name) || (step === 2 && !selectedSegment)}
            onClick={() => {
              if (step < 5) setStep((s) => s + 1);
              else handleFinish();
            }}
          >
            {saving ? "Salvando..." : step === 5 ? "Abrir dashboard" : "Continuar"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
