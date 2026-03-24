import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { KpiDatum } from "@/types/dashboard";

type KpiCardProps = {
  datum: KpiDatum;
};

export function KpiCard({ datum }: KpiCardProps) {
  const positive = datum.delta >= 0;
  const toneClass = {
    brand: "from-sky-400/18 to-transparent",
    success: "from-emerald-400/18 to-transparent",
    warning: "from-amber-400/18 to-transparent",
    neutral: "from-white/5 to-transparent",
  }[datum.tone];

  return (
    <Card className={cn("metric-glow relative overflow-hidden rounded-2xl border-white/8 bg-gradient-to-br p-4", toneClass)}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">{datum.label}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{datum.value}</p>
        </div>
        <Badge tone={positive ? "success" : "danger"} className="gap-1">
          {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {Math.abs(datum.delta).toFixed(1)}%
        </Badge>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-[var(--text-secondary)]">{datum.helper}</p>
        <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">Live</span>
      </div>
    </Card>
  );
}
