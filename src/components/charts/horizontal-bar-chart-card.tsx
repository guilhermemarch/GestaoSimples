"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "./chart-container";
import { axisTick, chartColors, tooltipStyle } from "./chart-tokens";
import { formatCurrency } from "@/lib/format";

type DataPoint = { faixa: string; valor: number; count: number };

type Props = {
  title: string;
  data: DataPoint[];
};

export function HorizontalBarChartCard({ title, data }: Props) {
  return (
    <Card variant="panel" className="min-w-0 shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer heightClassName="h-[220px]">
          {({ width, height }) => (
            <ResponsiveContainer width={width} height={height}>
              <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} horizontal={false} />
                <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="faixa"
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                  width={76}
                />
                <Tooltip
                  formatter={(value, _name, props) => {
                    const count = (props?.payload as DataPoint)?.count ?? 0;
                    return [`${formatCurrency(Number(value ?? 0))} (${count} contas)`, "Valor"];
                  }}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="valor" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                  {data.map((_, i) => (
                    <Cell key={i} fill={i === 3 ? chartColors.danger : chartColors.primary} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
