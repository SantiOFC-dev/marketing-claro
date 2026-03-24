"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency, formatInteger } from "@/lib/utils";
import type { DailySummaryPoint, MetricKey } from "@/types/dashboard";

type LineChartWidgetProps = {
  data: DailySummaryPoint[];
  metric: Extract<MetricKey, "reach" | "spend" | "leads">;
};

const metricConfig = {
  reach: { color: "#4AA8FF", label: "Reach", formatter: formatInteger },
  spend: { color: "#FFB648", label: "Spend", formatter: formatCurrency },
  leads: { color: "#3BDC97", label: "Leads", formatter: formatInteger },
};

export function LineChartWidget({ data, metric }: LineChartWidgetProps) {
  const config = metricConfig[metric];

  return (
    <div className="h-[280px] w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${metric}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor={config.color} stopOpacity={0.34} />
              <stop offset="95%" stopColor={config.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.12)" />
          <XAxis dataKey="dateLabel" tick={{ fill: "#71849D", fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: "#71849D", fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => config.formatter(Number(value))} />
          <Tooltip
            contentStyle={{
              background: "#0f1723",
              border: "1px solid rgba(148,163,184,0.18)",
              borderRadius: 16,
              color: "#EDF2F7",
            }}
            formatter={(value) => config.formatter(Number(value ?? 0))}
          />
          <Area type="monotone" dataKey={metric} stroke={config.color} strokeWidth={2.2} fill={`url(#gradient-${metric})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
