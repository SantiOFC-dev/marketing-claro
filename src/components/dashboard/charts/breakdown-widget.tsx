"use client";

import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatInteger } from "@/lib/utils";
import type { BreakdownPoint } from "@/types/dashboard";

type BreakdownWidgetProps = {
  data: BreakdownPoint[];
};

const toneByStatus = {
  Active: "success",
  Learning: "warning",
  Limited: "danger",
} as const;

export function BreakdownWidget({ data }: BreakdownWidgetProps) {
  const max = data[0]?.reach ?? 1;

  return (
    <div className="space-y-4 pt-4">
      {data.slice(0, 5).map((item) => (
        <div key={item.campaignId} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">{item.campaign}</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">{formatInteger(item.reach)} personas · {formatCurrency(item.spend)}</p>
            </div>
            <Badge tone={toneByStatus[item.status]}>{item.status}</Badge>
          </div>
          <div className="mt-3 h-2 rounded-full bg-white/6">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-300" style={{ width: `${(item.reach / max) * 100}%` }} />
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">{formatInteger(item.leads)} leads generados</p>
        </div>
      ))}
    </div>
  );
}
