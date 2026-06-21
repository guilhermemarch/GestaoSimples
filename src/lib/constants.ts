export const colors = {
  primary: "#16a34a",
  primaryHover: "#15803d",
  primarySoft: "#dcfce7",
  secondary: "#f1f5f3",
  background: "#f7f8f6",
  surface: "#ffffff",
  text: "#1f2933",
  textMuted: "#64748b",
  warning: "#d97706",
  warningSoft: "#fef3c7",
  error: "#dc2626",
  errorSoft: "#fee2e2",
  info: "#2563eb",
  infoSoft: "#dbeafe",
  success: "#16a34a",
  successSoft: "#dcfce7",
  border: "#e5e7eb",
} as const;

export const SERVICE_STATUS_LABELS: Record<string, string> = {
  QUOTE: "Orçamento",
  APPROVED: "Aprovado",
  IN_PROGRESS: "Em andamento",
  WAITING_PARTS: "Aguardando peça",
  COMPLETED: "Concluído",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/vendas/nova", label: "Nova venda", icon: "ShoppingCart" },
  { href: "/clientes", label: "Clientes", icon: "Users" },
  { href: "/produtos", label: "Produtos", icon: "Package" },
  { href: "/estoque", label: "Estoque", icon: "Warehouse" },
  { href: "/caixa", label: "Caixa", icon: "Wallet" },
  { href: "/financeiro", label: "Financeiro", icon: "Landmark", financial: true },
  { href: "/servicos", label: "Serviços", icon: "Wrench" },
  { href: "/relatorios", label: "Relatórios", icon: "BarChart3", financial: true },
  { href: "/configuracoes", label: "Configurações", icon: "Settings", admin: true },
] as const;
