import { cn } from "@/lib/utils";

const variants = {
  success: "bg-success-soft text-success border-success/20",
  warning: "bg-warning-soft text-warning border-warning/20",
  error: "bg-danger-soft text-danger border-danger/20",
  info: "bg-info-soft text-info border-info/20",
  neutral: "bg-muted text-muted-foreground border-border",
} as const;

type Props = {
  label: string;
  variant?: keyof typeof variants;
};

export function StatusIndicator({ label, variant = "neutral" }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
      )}
    >
      {label}
    </span>
  );
}
