"use client";

import { useEffect, useState } from "react";
import { Building2, Package, Receipt, Shield, ShoppingCart, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/system/data-table";
import { StatusBadge } from "@/components/system/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { api, ApiError, type SessionUser } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { ROLE_LABELS } from "@/lib/labels";
import type { CompanySettings } from "@/lib/company-settings";

type Company = {
  name: string;
  tradeName: string | null;
  document: string | null;
  phone: string | null;
  address: string | null;
  addressStreet: string | null;
  addressNeighborhood: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressZip: string | null;
  segment: string | null;
};

type CompanySettingsResponse = {
  planName: string;
  maxUsers: number;
  activeUsers: number;
  settings: CompanySettings;
  addressStreet: string | null;
  addressNeighborhood: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressZip: string | null;
};

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
};

const TABS = [
  { id: "empresa", label: "Empresa", icon: Building2 },
  { id: "usuarios", label: "Usuários", icon: Users },
  { id: "permissoes", label: "Permissões", icon: Shield },
  { id: "vendas", label: "Vendas", icon: ShoppingCart },
  { id: "estoque", label: "Estoque", icon: Package },
  { id: "financeiro", label: "Financeiro", icon: Receipt },
  { id: "notificacoes", label: "Notificações", icon: Receipt },
  { id: "integracoes", label: "Integrações", icon: Receipt },
  { id: "preferencias", label: "Preferências", icon: Receipt },
] as const;

type TabId = (typeof TABS)[number]["id"];

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
      <div>
        <p className="font-medium text-foreground">{label}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-muted",
          disabled && "opacity-50",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}

export function ConfiguracoesContent() {
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [planInfo, setPlanInfo] = useState({ planName: "Profissional", maxUsers: 5, activeUsers: 1 });
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("empresa");

  useEffect(() => {
    Promise.all([
      api.get<{ user: SessionUser }>("/api/auth/me"),
      api.get<Company>("/api/company"),
      api.get<CompanySettingsResponse>("/api/company/settings"),
    ])
      .then(async ([me, comp, companySettings]) => {
        setCurrentUser(me.user);
        setCompany({
          ...comp,
          addressStreet: comp.addressStreet ?? companySettings.addressStreet,
          addressNeighborhood: comp.addressNeighborhood ?? companySettings.addressNeighborhood,
          addressCity: comp.addressCity ?? companySettings.addressCity,
          addressState: comp.addressState ?? companySettings.addressState,
          addressZip: comp.addressZip ?? companySettings.addressZip,
        });
        setPlanInfo({
          planName: companySettings.planName,
          maxUsers: companySettings.maxUsers,
          activeUsers: companySettings.activeUsers,
        });
        setSettings(companySettings.settings);
        if (me.user.role === "ADMIN" || me.user.role === "MANAGER") {
          try {
            const userList = await api.get<User[]>("/api/users");
            setUsers(userList);
          } catch {
            // operador sem acesso
          }
        }
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Erro ao carregar configurações"))
      .finally(() => setLoading(false));
  }, []);

  function updateCompany(field: keyof Company, value: string) {
    setCompany((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  async function handleSaveCompany(e: React.FormEvent) {
    e.preventDefault();
    if (!company) return;
    setSaving(true);
    try {
      await api.put("/api/company", company);
      await api.patch("/api/company/settings", {
        addressStreet: company.addressStreet,
        addressNeighborhood: company.addressNeighborhood,
        addressCity: company.addressCity,
        addressState: company.addressState,
        addressZip: company.addressZip,
      });
      toast.success("Empresa atualizada com sucesso");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao salvar empresa");
    } finally {
      setSaving(false);
    }
  }

  async function patchSettings(updates: Partial<CompanySettings>) {
    if (!settings || !canEditCompany) return;
    const previous = settings;
    const next = { ...settings, ...updates };
    setSettings(next);
    setSavingSettings(true);
    try {
      await api.patch("/api/company/settings", { settings: updates });
    } catch (err) {
      setSettings(previous);
      toast.error(err instanceof ApiError ? err.message : "Erro ao salvar configuração");
    } finally {
      setSavingSettings(false);
    }
  }

  const canEditCompany = currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER";
  const isAdmin = currentUser?.role === "ADMIN";

  if (loading || !company || !settings) {
    return (
      <>
        <PageHeader title="Configurações" description="Dados da empresa, usuários e preferências do sistema" />
        <div className="mb-5 flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-3 shadow-card">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="grid min-w-0 gap-4 lg:grid-cols-4 [&>*]:min-w-0">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-64 rounded-lg lg:col-span-3" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Configurações" description="Dados da empresa, usuários e preferências do sistema" />

      <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-card">
        <div className="flex min-w-0 items-center gap-2">
          <Building2 className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-muted-foreground">Empresa:</span>
          <span className="truncate font-medium text-foreground">{company.tradeName ?? company.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Plano:</span>
          <span className="font-medium text-foreground">{planInfo.planName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Usuários:</span>
          <span className="font-medium text-foreground">{planInfo.activeUsers}/{planInfo.maxUsers}</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Perfil:</span>
          <span className="font-medium text-foreground">{ROLE_LABELS[currentUser?.role ?? ""] ?? currentUser?.role ?? "—"}</span>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-4 [&>*]:min-w-0">
        <Card variant="panel" className="shadow-card lg:col-span-1">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const hidden = tab.id === "usuarios" && !isAdmin;
                const adminOnly = tab.id === "permissoes" && !isAdmin;
                if (hidden || adminOnly) return null;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        <div className="min-w-0 lg:col-span-3">
          {activeTab === "empresa" && (
            <Card variant="panel" className="shadow-card">
              <CardHeader>
                <CardTitle className="text-sm">Dados da empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveCompany} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Razão social</Label>
                      <Input
                        value={company.name}
                        onChange={(e) => updateCompany("name", e.target.value)}
                        disabled={!canEditCompany}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nome fantasia</Label>
                      <Input
                        value={company.tradeName ?? ""}
                        onChange={(e) => updateCompany("tradeName", e.target.value)}
                        disabled={!canEditCompany}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Segmento</Label>
                      <Input
                        value={company.segment ?? ""}
                        onChange={(e) => updateCompany("segment", e.target.value)}
                        disabled={!canEditCompany}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CNPJ/CPF</Label>
                      <Input
                        value={company.document ?? ""}
                        onChange={(e) => updateCompany("document", e.target.value)}
                        disabled={!canEditCompany}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input
                        value={company.phone ?? ""}
                        onChange={(e) => updateCompany("phone", e.target.value)}
                        disabled={!canEditCompany}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CEP</Label>
                      <Input
                        value={company.addressZip ?? ""}
                        onChange={(e) => updateCompany("addressZip", e.target.value)}
                        disabled={!canEditCompany}
                        placeholder="00000-000"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Logradouro</Label>
                      <Input
                        value={company.addressStreet ?? ""}
                        onChange={(e) => updateCompany("addressStreet", e.target.value)}
                        disabled={!canEditCompany}
                        placeholder="Rua, número"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bairro</Label>
                      <Input
                        value={company.addressNeighborhood ?? ""}
                        onChange={(e) => updateCompany("addressNeighborhood", e.target.value)}
                        disabled={!canEditCompany}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cidade</Label>
                      <Input
                        value={company.addressCity ?? ""}
                        onChange={(e) => updateCompany("addressCity", e.target.value)}
                        disabled={!canEditCompany}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Input
                        value={company.addressState ?? ""}
                        onChange={(e) => updateCompany("addressState", e.target.value)}
                        disabled={!canEditCompany}
                        placeholder="UF"
                        maxLength={2}
                      />
                    </div>
                  </div>
                  {canEditCompany && (
                    <div className="flex justify-end border-t border-border pt-4">
                      <Button type="submit" className="bg-primary hover:bg-primary-hover" disabled={saving}>
                        {saving ? "Salvando..." : "Salvar alterações"}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "usuarios" && isAdmin && (
            <Card variant="panel" className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum usuário encontrado</p>
                ) : (
                  <DataTable
                    data={users}
                    keyFn={(u) => u.id}
                    className="border-0 shadow-none"
                    columns={[
                      { key: "name", header: "Nome", maxWidth: "200px", render: (u) => <span className="truncate">{u.name}</span> },
                      { key: "email", header: "E-mail", maxWidth: "220px", render: (u) => <span className="truncate">{u.email}</span> },
                      {
                        key: "role",
                        header: "Perfil",
                        maxWidth: "130px",
                        render: (u) => (
                          <StatusBadge label={ROLE_LABELS[u.role] ?? u.role} variant="info" />
                        ),
                      },
                      { key: "createdAt", header: "Desde", maxWidth: "130px", render: (u) => formatDate(u.createdAt) },
                    ]}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "permissoes" && isAdmin && (
            <Card variant="panel" className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Permissões por perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { role: "Administrador", desc: "Acesso total ao sistema" },
                  { role: "Gerente", desc: "Vendas, estoque, caixa e relatórios financeiros" },
                  { role: "Operador", desc: "Vendas, clientes e abertura de caixa" },
                ].map((item) => (
                  <div key={item.role} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="font-medium">{item.role}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <StatusBadge label="Ativo" variant="ativo" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === "vendas" && (
            <Card variant="panel" className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Configurações de vendas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ToggleRow
                  label="Permitir desconto acima de 10%"
                  description="Exige confirmação do gerente para descontos elevados"
                  checked={settings.allowHighDiscount}
                  onChange={(v) => patchSettings({ allowHighDiscount: v })}
                  disabled={!canEditCompany || savingSettings}
                />
                <ToggleRow
                  label="Gerar conta a receber automaticamente"
                  description="Vendas a prazo criam título financeiro"
                  checked={settings.autoReceivable}
                  onChange={(v) => patchSettings({ autoReceivable: v })}
                  disabled={!canEditCompany || savingSettings}
                />
                <ToggleRow
                  label="Atalhos de teclado (F1–F9)"
                  description="Habilitar atalhos na tela Nova venda"
                  checked={settings.keyboardShortcuts}
                  onChange={(v) => patchSettings({ keyboardShortcuts: v })}
                  disabled={savingSettings}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === "estoque" && (
            <Card variant="panel" className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Configurações de estoque</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ToggleRow
                  label="Alertas de estoque mínimo"
                  description="Notificar quando produto atingir o mínimo configurado"
                  checked={settings.notifyLowStock}
                  onChange={(v) => patchSettings({ notifyLowStock: v })}
                  disabled={savingSettings}
                />
                <ToggleRow
                  label="Bloquear venda sem estoque"
                  description="Impedir vendas de produtos com estoque zero"
                  checked={true}
                  onChange={() => toast.info("Disponível em versão futura")}
                  disabled={!canEditCompany}
                />
                <ToggleRow
                  label="Controle por lote"
                  description="Rastrear validade e lote de produtos"
                  checked={false}
                  onChange={() => toast.info("Disponível em versão futura")}
                  disabled={!canEditCompany}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === "financeiro" && (
            <Card variant="panel" className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ToggleRow
                  label="Exigir conciliação no fechamento"
                  checked={settings.requireCashReconciliation}
                  onChange={(v) => patchSettings({ requireCashReconciliation: v })}
                  disabled={!canEditCompany || savingSettings}
                />
                <ToggleRow
                  label="Alertar contas vencidas"
                  checked={settings.notifyOverdue}
                  onChange={(v) => patchSettings({ notifyOverdue: v })}
                  disabled={savingSettings}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === "notificacoes" && (
            <Card variant="panel" className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Notificações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ToggleRow
                  label="E-mail de alertas"
                  description="Receber resumo diário por e-mail"
                  checked={settings.emailAlerts}
                  onChange={(v) => patchSettings({ emailAlerts: v })}
                  disabled={!canEditCompany || savingSettings}
                />
                <ToggleRow
                  label="WhatsApp"
                  description="Enviar cobranças por WhatsApp"
                  checked={settings.whatsappEnabled}
                  onChange={(v) => patchSettings({ whatsappEnabled: v })}
                  disabled={!canEditCompany || savingSettings}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === "integracoes" && (
            <Card variant="panel" className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Integrações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Conecte emissão de NF-e, marketplaces e contabilidade. Disponível em versões futuras.
                </p>
              </CardContent>
            </Card>
          )}

          {activeTab === "preferencias" && (
            <Card variant="panel" className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Preferências do sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ToggleRow
                  label="Alertas de estoque baixo"
                  description="Receber avisos quando produtos atingirem o estoque mínimo"
                  checked={settings.notifyLowStock}
                  onChange={(v) => patchSettings({ notifyLowStock: v })}
                  disabled={savingSettings}
                />
                <ToggleRow
                  label="Alertas de contas vencidas"
                  description="Notificar sobre contas a receber em atraso"
                  checked={settings.notifyOverdue}
                  onChange={(v) => patchSettings({ notifyOverdue: v })}
                  disabled={savingSettings}
                />
                <ToggleRow
                  label="Backup automático"
                  description="Salvar cópia dos dados semanalmente"
                  checked={settings.autoBackup}
                  onChange={(v) => patchSettings({ autoBackup: v })}
                  disabled={!isAdmin || savingSettings}
                />
                <ToggleRow
                  label="Resumo financeiro no dashboard"
                  description="Exibir indicadores financeiros para gerentes"
                  checked={settings.showFinancialSummary}
                  onChange={(v) => patchSettings({ showFinancialSummary: v })}
                  disabled={savingSettings}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
