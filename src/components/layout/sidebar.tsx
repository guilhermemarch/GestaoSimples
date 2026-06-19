"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Warehouse,
  Wallet,
  Landmark,
  Wrench,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { BrandLogo } from "@/components/system/brand-logo";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import type { SessionUser } from "@/lib/api-client";

const ICONS = {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Warehouse,
  Wallet,
  Landmark,
  Wrench,
  BarChart3,
  Settings,
} as const;

type Props = { user: SessionUser; onNavigate?: () => void };

export function Sidebar({ user, onNavigate }: Props) {
  const pathname = usePathname();
  const canFinancial = user.role === "ADMIN" || user.role === "MANAGER";

  const items = NAV_ITEMS.filter((item) => {
    if ("financial" in item && item.financial && !canFinancial) return false;
    if ("admin" in item && item.admin && user.role !== "ADMIN") return false;
    return true;
  });

  return (
    <aside className="flex h-full w-full flex-col bg-card">
      <div
        className="flex shrink-0 items-center px-5"
        style={{ height: "var(--topbar-h)" }}
      >
        <BrandLogo size="sm" />
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {items.map((item) => {
          const Icon = ICONS[item.icon as keyof typeof ICONS];
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)) ||
            (item.href === "/estoque" && pathname.startsWith("/estoque"));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="shrink-0 p-3">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <HelpCircle className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground">Precisa de ajuda?</p>
            <p className="text-[11px] text-muted-foreground">Acesse nossa central de ajuda.</p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </div>
      </div>
    </aside>
  );
}
