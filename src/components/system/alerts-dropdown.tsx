"use client";

import Link from "next/link";
import { Bell, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Alert } from "@/lib/alerts";

type Props = { alerts: Alert[] };

export function AlertsDropdown({ alerts }: Props) {
  const count = alerts.length;
  const visible = alerts.slice(0, 8);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-2 text-muted-foreground hover:text-foreground">
          <div className="relative">
            <Bell className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </div>
          <span className="hidden text-sm sm:inline">
            {count} alerta{count !== 1 ? "s" : ""}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Alertas do sistema</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {count === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
            Nenhum alerta no momento
          </div>
        ) : (
          <>
            {visible.map((alert, i) => (
              <DropdownMenuItem key={`${alert.type}-${i}`} asChild>
                <Link href={alert.href} className="flex cursor-pointer items-start gap-2 py-2">
                  {alert.severity === "warning" ? (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  ) : (
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
                  )}
                  <span className="text-sm leading-snug">{alert.message}</span>
                </Link>
              </DropdownMenuItem>
            ))}
            {count > 8 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="text-center text-sm font-medium text-primary">
                    Ver todos os alertas ({count})
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
