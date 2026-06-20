import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value?: string;
  subtitle?: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  linkLabel?: string;
  iconClassName?: string;
  className?: string;
};

export function ActionCard({
  label,
  value,
  subtitle,
  icon: Icon,
  href,
  onClick,
  linkLabel,
  iconClassName = "text-primary",
  className,
}: Props) {
  const content = (
    <Card
      variant="panel"
      className={cn(
        "h-full min-w-0 shadow-card transition-shadow",
        (href || onClick) && "cursor-pointer hover:shadow-card-hover",
        className,
      )}
      onClick={onClick}
    >
      <CardContent className="flex h-full items-center gap-3 p-3">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent",
            iconClassName,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-foreground">{label}</p>
          {value && <p className="text-sm font-bold text-foreground">{value}</p>}
          <div className="min-h-[2.5rem]">
            {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
            {linkLabel && (
              <p
                className={cn(
                  "text-xs font-medium text-primary",
                  subtitle ? "mt-0.5" : "mt-1",
                )}
              >
                {linkLabel.replace(">", "›")}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) return <Link href={href} className="block h-full">{content}</Link>;
  return content;
}
