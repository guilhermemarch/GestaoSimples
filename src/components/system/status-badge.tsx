import { cn } from "@/lib/utils";

export type StatusBadgeVariant =
  | "pago"
  | "pendente"
  | "vencido"
  | "em-estoque"
  | "estoque-baixo"
  | "sem-estoque"
  | "ativo"
  | "inativo"
  | "aprovado"
  | "em-andamento"
  | "aguardando-peca"
  | "concluido"
  | "venda"
  | "sangria"
  | "reforco"
  | "despesa"
  | "entrada"
  | "saida"
  | "ajuste"
  | "vip"
  | "novo"
  | "info"
  | "neutral"
  | "parcial";

const variants: Record<StatusBadgeVariant, string> = {
  pago: "bg-success-soft text-success border-success/20",
  pendente: "bg-warning-soft text-warning border-warning/20",
  vencido: "bg-danger-soft text-danger border-danger/20",
  "em-estoque": "bg-success-soft text-success border-success/20",
  "estoque-baixo": "bg-warning-soft text-warning border-warning/20",
  "sem-estoque": "bg-danger-soft text-danger border-danger/20",
  ativo: "bg-success-soft text-success border-success/20",
  inativo: "bg-muted text-muted-foreground border-border",
  aprovado: "bg-success-soft text-success border-success/20",
  "em-andamento": "bg-info-soft text-info border-info/20",
  "aguardando-peca": "bg-warning-soft text-warning border-warning/20",
  concluido: "bg-success-soft text-success border-success/20",
  venda: "bg-success-soft text-success border-success/20",
  sangria: "bg-danger-soft text-danger border-danger/20",
  reforco: "bg-success-soft text-success border-success/20",
  despesa: "bg-warning-soft text-warning border-warning/20",
  entrada: "bg-success-soft text-success border-success/20",
  saida: "bg-danger-soft text-danger border-danger/20",
  ajuste: "bg-warning-soft text-warning border-warning/20",
  vip: "bg-info-soft text-info border-info/20",
  novo: "bg-info-soft text-info border-info/20",
  info: "bg-info-soft text-info border-info/20",
  parcial: "bg-info-soft text-info border-info/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

const dotColors: Record<StatusBadgeVariant, string> = {
  pago: "bg-success",
  pendente: "bg-warning",
  vencido: "bg-danger",
  "em-estoque": "bg-success",
  "estoque-baixo": "bg-warning",
  "sem-estoque": "bg-danger",
  ativo: "bg-success",
  inativo: "bg-muted-foreground",
  aprovado: "bg-success",
  "em-andamento": "bg-info",
  "aguardando-peca": "bg-warning",
  concluido: "bg-success",
  venda: "bg-success",
  sangria: "bg-danger",
  reforco: "bg-success",
  despesa: "bg-warning",
  entrada: "bg-success",
  saida: "bg-danger",
  ajuste: "bg-warning",
  vip: "bg-info",
  novo: "bg-info",
  info: "bg-info",
  parcial: "bg-info",
  neutral: "bg-muted-foreground",
};

type Props = {
  label: string;
  variant?: StatusBadgeVariant;
  showDot?: boolean;
  className?: string;
};

export function StatusBadge({ label, variant = "neutral", showDot = true, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {showDot && <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[variant])} />}
      {label}
    </span>
  );
}
