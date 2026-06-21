export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Dinheiro",
  PIX: "PIX",
  DEBIT_CARD: "Cartão débito",
  CREDIT_CARD: "Cartão crédito",
  PENDING: "A prazo",
};

export const RECEIVABLE_STATUS_LABELS: Record<string, string> = {
  OPEN: "Em aberto",
  OVERDUE: "Vencida",
  PARTIAL: "Parcial",
  PAID: "Paga",
};

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  RENT: "Aluguel",
  ENERGY: "Energia",
  INTERNET: "Internet",
  SALARY: "Salário",
  SUPPLIER: "Fornecedor",
  MAINTENANCE: "Manutenção",
  TAX: "Impostos",
  OTHER: "Outros",
};

export const CASH_MOVEMENT_LABELS: Record<string, string> = {
  SALE: "Venda",
  REINFORCEMENT: "Reforço",
  WITHDRAWAL: "Sangria",
  EXPENSE: "Despesa",
};

export function formatCashMovementDescription(description: string | null, type?: string): string {
  if (!description?.trim()) {
    return type ? (CASH_MOVEMENT_LABELS[type] ?? "—") : "—";
  }

  const vendaMatch = description.match(/^Venda\s+([a-f0-9-]+)$/i);
  if (vendaMatch) {
    return `Venda #${vendaMatch[1].slice(-6).toUpperCase()}`;
  }

  const estornoMatch = description.match(/^Estorno venda\s+([a-f0-9-]+)$/i);
  if (estornoMatch) {
    return `Estorno venda #${estornoMatch[1].slice(-6).toUpperCase()}`;
  }

  return description;
}

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  MANAGER: "Gerente",
  OPERATOR: "Operador",
};
