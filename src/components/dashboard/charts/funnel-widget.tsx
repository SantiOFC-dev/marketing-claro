"use client";

import { formatInteger } from "@/lib/utils";

type FunnelWidgetProps = {
  data: Array<{ stage: string; value: number }>;
};

export function FunnelWidget({ data }: FunnelWidgetProps) {
  const max = data[0]?.value ?? 1;

  return (
    <div className="space-y-3 pt-4">
      {data.map((item, index) => {
        const width = Math.max(18, (item.value / max) * 100);
        return (
          <div key={item.stage} className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>{index + 1}. {item.stage}</span>
              <span>{formatInteger(item.value)}</span>
            </div>
            <div className="h-11 rounded-2xl bg-white/[0.04] p-1.5">
              <div
                className="flex h-full items-center rounded-[14px] bg-gradient-to-r from-sky-500/80 via-sky-400/65 to-cyan-300/70 px-3 text-sm font-medium text-slate-950 transition-all"
                style={{ width: `${width}%` }}
              >
                {item.stage}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
