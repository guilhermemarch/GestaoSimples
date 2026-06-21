"use client";

import {
  BarChart,
  Bar,
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

type DataPoint = {
  label: string;
  recebimentos?: number;
  despesas?: number;
};

type Props = {
  title: string;
  data: DataPoint[];
  footerLink?: { label: string; href: string };
};

export function BarChartCard({ title, data, footerLink }: Props) {
  return (
    <Card variant="panel" className="min-w-0 shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer>
          {({ width, height }) => (
            <ResponsiveContainer width={width} height={height}>
              <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} vertical={false} />
                <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} width={48} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value ?? 0))}
                  contentStyle={tooltipStyle}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="recebimentos" name="Recebimentos" fill={chartColors.primary} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="despesas" name="Despesas" fill={chartColors.danger} radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>
        {footerLink && (
          <a href={footerLink.href} className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
            {footerLink.label}
          </a>
        )}
      </CardContent>
    </Card>
  );
}
