"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartContainer } from "./chart-container";
import { axisTick, chartColors, tooltipStyle } from "./chart-tokens";
import { formatCurrency } from "@/lib/format";

type DataPoint = { label: string; value: number };

type Props = {
  title: string;
  data: DataPoint[];
  period?: string;
  onPeriodChange?: (value: string) => void;
  periodOptions?: { value: string; label: string }[];
};

export function LineChartCard({
  title,
  data,
  period,
  onPeriodChange,
  periodOptions = [{ value: "7d", label: "Últimos 7 dias" }],
}: Props) {
  return (
    <Card variant="panel" className="flex h-full min-w-0 flex-col shadow-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {onPeriodChange && (
          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger className="h-8 w-[130px] text-xs sm:w-[140px]">
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
        <ChartContainer>
          {({ width, height }) => (
            <ResponsiveContainer width={width} height={height}>
              <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} vertical={false} />
                <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} width={48} />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value ?? 0)), "Valor"]}
                  contentStyle={tooltipStyle}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={chartColors.primary}
                  strokeWidth={2}
                  dot={{ fill: chartColors.primary, r: 3 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
