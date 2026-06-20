import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  linkLabel?: string;
  linkHref?: string;
  stats?: { label: string; value: string }[];
  variant?: "warning" | "error" | "info";
  className?: string;
};

const variantStyles = {
  warning: "border-warning/20 bg-warning-soft",
  error: "border-danger/20 bg-danger-soft",
  info: "border-info/20 bg-info-soft",
};

const iconStyles = {
  warning: "text-warning",
  error: "text-danger",
  info: "text-info",
};

export function AlertBanner({
  title,
  description,
  icon: Icon,
  linkLabel,
  linkHref,
  stats,
  variant = "warning",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-lg border p-4 shadow-card sm:flex-row sm:items-center sm:justify-between lg:p-5",
        variantStyles[variant],
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconStyles[variant])} />}
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{title}</p>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          {linkLabel && linkHref && (
            <Link href={linkHref} className="mt-1 inline-block text-sm font-medium text-primary hover:underline">
              {linkLabel}
            </Link>
          )}
        </div>
      </div>
      {stats && stats.length > 0 && (
        <div className="flex shrink-0 divide-x divide-border">
          {stats.map((stat) => (
            <div key={stat.label} className="px-4 text-center first:pl-0 last:pr-0">
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
