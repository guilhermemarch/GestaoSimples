"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "./chart-container";
import { axisTick, chartColors, tooltipStyle } from "./chart-tokens";
import { formatCurrency } from "@/lib/format";

type DataPoint = { label: string; entradas: number; saidas: number };

type Props = {
  title: string;
  data: DataPoint[];
};

export function DualLineChartCard({ title, data }: Props) {
  return (
    <Card variant="panel" className="min-w-0 shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer>
          {({ width, height }) => (
            <ResponsiveContainer width={width} height={height}>
              <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} vertical={false} />
                <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} width={48} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value ?? 0))}
                  contentStyle={tooltipStyle}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="entradas"
                  name="Entradas"
                  stroke={chartColors.primary}
                  strokeWidth={2}
                  dot={{ fill: chartColors.primary, r: 3 }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="saidas"
                  name="Saídas"
                  stroke={chartColors.danger}
                  strokeWidth={2}
                  dot={{ fill: chartColors.danger, r: 3 }}
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
