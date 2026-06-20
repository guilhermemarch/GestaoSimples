import { formatCurrency } from "@/lib/format";

type Props = { value: number; className?: string };

export function MoneyValue({ value, className }: Props) {
  return <span className={className}>{formatCurrency(value)}</span>;
}
