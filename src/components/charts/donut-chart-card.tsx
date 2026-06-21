"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartContainer } from "./chart-container";
import { chartColors, tooltipStyle } from "./chart-tokens";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type Slice = { name: string; value: number; color: string };

type Props = {
  title: string;
  data: Slice[];
  centerLabel?: string;
  centerValue?: string;
  footerLink?: { label: string; href: string };
  period?: string;
  onPeriodChange?: (value: string) => void;
  periodOptions?: { value: string; label: string }[];
  emptyLabel?: string;
};

export function DonutChartCard({
  title,
  data,
  centerLabel,
  centerValue,
  footerLink,
  period,
  onPeriodChange,
  periodOptions = [{ value: "today", label: "Hoje" }],
  emptyLabel = "Sem dados",
}: Props) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const isEmpty = data.length === 0 || total === 0;
  const chartData = isEmpty
    ? [{ name: "_empty", value: 1, color: chartColors.empty }]
    : data;

  return (
    <Card variant="panel" className="flex h-full min-w-0 flex-col shadow-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {onPeriodChange && (
          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger className="h-8 w-[100px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center gap-4 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <ChartContainer
              heightClassName=""
              className="aspect-square w-[150px] sm:w-[180px]"
            >
              {({ width, height }) => {
                const size = Math.min(width, height);
                const outer = Math.max(20, size * 0.44);
                const inner = Math.max(12, size * 0.3);
                return (
                  <ResponsiveContainer width={width} height={height}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={inner}
                        outerRadius={outer}
                        paddingAngle={isEmpty ? 0 : 2}
                        dataKey="value"
                        isAnimationActive={false}
                      >
                        {chartData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      {!isEmpty && (
                        <Tooltip
                          formatter={(value) => formatCurrency(Number(value ?? 0))}
                          contentStyle={tooltipStyle}
                        />
                      )}
                    </PieChart>
                  </ResponsiveContainer>
                );
              }}
            </ChartContainer>
            {(centerLabel || centerValue) && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                {centerValue && (
                  <p className="text-sm font-bold text-foreground">{centerValue}</p>
                )}
                {centerLabel && (
                  <p className="text-[10px] text-muted-foreground">{centerLabel}</p>
                )}
              </div>
            )}
          </div>
          <div className={cn("min-w-0 w-full flex-1 space-y-2 sm:w-auto")}>
            {isEmpty ? (
              <div className="flex items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-muted" />
                  <span className="text-muted-foreground">{emptyLabel}</span>
                </div>
                <div className="text-right">
                  <span className="block font-medium text-foreground">0%</span>
                  <span className="text-xs text-muted-foreground">{formatCurrency(0)}</span>
                </div>
              </div>
            ) : (
              data.map((slice) => (
                <div key={slice.name} className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
                    <span className="truncate text-muted-foreground">{slice.name}</span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="block font-medium text-foreground">
                      {`${Math.round((slice.value / total) * 100)}%`}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatCurrency(slice.value)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {footerLink && (
          <a href={footerLink.href} className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
            {footerLink.label}
          </a>
        )}
      </CardContent>
    </Card>
  );
}
