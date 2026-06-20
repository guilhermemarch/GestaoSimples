import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TrendDirection = "up" | "down" | "neutral";

type Props = {
  title: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendDirection?: TrendDirection;
  icon?: LucideIcon;
  iconClassName?: string;
  className?: string;
};

const trendColors: Record<TrendDirection, string> = {
  up: "text-success",
  down: "text-danger",
  neutral: "text-muted-foreground",
};

const iconBgColors: Record<string, string> = {
  green: "bg-success-soft text-success",
  orange: "bg-warning-soft text-warning",
  red: "bg-danger-soft text-danger",
  blue: "bg-info-soft text-info",
};

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendDirection = "up",
  icon: Icon,
  iconClassName = "green",
  className,
}: Props) {
  return (
    <Card variant="metric" className={cn("h-full shadow-card", className)}>
      <CardContent className="flex h-full items-center gap-3 p-3 lg:p-4">
        {Icon && (
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
              iconBgColors[iconClassName] ?? iconBgColors.green,
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-muted-foreground">{title}</p>
          <p className="mt-0.5 text-lg font-bold tracking-tight text-foreground lg:text-xl">
            {value}
          </p>
          <div className="mt-0.5 min-h-[2.75rem]">
            {subtitle && (
              <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <p
                className={cn(
                  "text-xs font-medium",
                  subtitle ? "mt-1" : "mt-0.5",
                  trendColors[trendDirection],
                )}
              >
                {trend}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
