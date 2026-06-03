"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Generate mock data for sales
const generateSalesData = (days: number) => {
  const data = [];
  const today = new Date();
  const baseRevenue = 1500000;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const randomFactor = 0.7 + Math.random() * 0.6;
    const revenue = Math.round(baseRevenue * randomFactor);

    data.push({
      date: date.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      fullDate: date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      revenue,
    });
  }
  return data;
};

const dataSets: Record<string, ReturnType<typeof generateSalesData>> = {
  "7d": generateSalesData(7),
  "30d": generateSalesData(30),
  "3m": generateSalesData(90),
  "1y": generateSalesData(365),
};

const formatIDR = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { fullDate: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
        <p className="text-xs text-muted-foreground">{payload[0].payload.fullDate}</p>
        <p className="text-sm font-medium text-foreground">
          {formatIDR(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

export function SalesChart() {
  const [period, setPeriod] = React.useState("30d");
  const data = dataSets[period];

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-medium text-foreground">Pendapatan</h3>
          <p className="text-sm text-muted-foreground">
            Total pendapatan periode ini
          </p>
        </div>
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList className="h-8">
            <TabsTrigger value="7d" className="text-xs px-3">7H</TabsTrigger>
            <TabsTrigger value="30d" className="text-xs px-3">30H</TabsTrigger>
            <TabsTrigger value="3m" className="text-xs px-3">3B</TabsTrigger>
            <TabsTrigger value="1y" className="text-xs px-3">1T</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="#E7E5E4"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#78716C", fontSize: 12 }}
              dy={10}
              interval={period === "7d" ? 0 : period === "30d" ? 4 : period === "3m" ? 14 : 30}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#78716C", fontSize: 12 }}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}jt`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#D97706"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#D97706", stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
