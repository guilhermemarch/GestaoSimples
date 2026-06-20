"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeaderAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "outline";
  icon?: LucideIcon;
};

type Props = {
  title: string;
  description?: string;
  showTitle?: boolean;
  actions?: HeaderAction[];
  badge?: { label: string; variant?: "success" | "neutral" };
  badgePosition?: "inline" | "end";
  className?: string;
};

function BadgePill({ badge }: { badge: { label: string; variant?: "success" | "neutral" } }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium",
        badge.variant === "success"
          ? "border-success/20 bg-success-soft text-success"
          : "border-border bg-muted text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          badge.variant === "success" ? "bg-success" : "bg-muted-foreground",
        )}
      />
      {badge.label}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  showTitle = true,
  actions,
  badge,
  badgePosition = "inline",
  className,
}: Props) {
  const allActions = actions ?? [];

  if (badgePosition === "end" && badge) {
    return (
      <div className={cn("mb-5", className)}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            {showTitle && (
              <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-[28px]">{title}</h1>
            )}
            {description && <p className={cn("text-sm text-muted-foreground", showTitle && "mt-1")}>{description}</p>}
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {allActions.map((act) => (
              <ActionButton key={act.label} act={act} />
            ))}
            <BadgePill badge={badge} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div>
        <div className="flex flex-wrap items-center gap-3">
          {showTitle && (
            <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-[28px]">{title}</h1>
          )}
          {badge && badgePosition === "inline" && <BadgePill badge={badge} />}
        </div>
        {description && <p className={cn("text-sm text-muted-foreground", showTitle && "mt-1")}>{description}</p>}
      </div>
      {allActions.length > 0 && (
        <div className="flex shrink-0 flex-wrap gap-2">
          {allActions.map((act) => (
            <ActionButton key={act.label} act={act} />
          ))}
        </div>
      )}
    </div>
  );
}

function ActionButton({ act }: { act: HeaderAction }) {
  const Icon = act.icon;
  const content = (
    <>
      {Icon && <Icon className="h-4 w-4" />}
      {act.label}
    </>
  );

  if (act.href) {
    return (
      <Button
        asChild
        variant={act.variant === "outline" ? "outline" : "default"}
        className={act.variant !== "outline" ? "gap-2 bg-primary hover:bg-primary-hover" : "gap-2"}
      >
        <Link href={act.href}>{content}</Link>
      </Button>
    );
  }

  return (
    <Button
      variant={act.variant === "outline" ? "outline" : "default"}
      className={act.variant !== "outline" ? "gap-2 bg-primary hover:bg-primary-hover" : "gap-2"}
      onClick={act.onClick}
    >
      {content}
    </Button>
  );
}
