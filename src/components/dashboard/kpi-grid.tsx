import { formatCurrency, formatInteger, formatPercent } from "@/lib/utils";
import type { DashboardModel, KpiDatum } from "@/types/dashboard";
import { KpiCard } from "./kpi-card";

type KpiGridProps = {
  model: DashboardModel;
};

export function KpiGrid({ model }: KpiGridProps) {
  const { aggregate, todaySnapshot, last7Snapshot } = model;

  const kpis: KpiDatum[] = [
    {
      id: "today",
      label: "Personas hoy",
      value: formatInteger(aggregate.currentDayReach),
      helper: "Comparacion contra ayer",
      tone: "brand",
      delta: todaySnapshot.reach,
    },
    {
      id: "goal",
      label: "Meta hoy",
      value: formatInteger(aggregate.currentDayTarget),
      helper: "Objetivo dinamico del dia activo",
      tone: "neutral",
      delta: aggregate.currentDayTarget === 0 ? 0 : (aggregate.currentDayReach / aggregate.currentDayTarget) * 100 - 100,
    },
    {
      id: "reach-total",
      label: "Total acumulado",
      value: formatInteger(aggregate.reach),
      helper: "Periodo visible en el dashboard",
      tone: "success",
      delta: last7Snapshot.reach,
    },
    {
      id: "spend-total",
      label: "Spend total",
      value: formatCurrency(aggregate.spend),
      helper: "Comparado con la ventana previa",
      tone: "warning",
      delta: last7Snapshot.spend,
    },
    {
      id: "leads-total",
      label: "Leads totales",
      value: formatInteger(aggregate.leads),
      helper: "Eficiencia del rango actual",
      tone: "success",
      delta: last7Snapshot.leads,
    },
    {
      id: "ctr",
      label: "CTR promedio",
      value: formatPercent(aggregate.ctr),
      helper: "Cambio de engagement vs 7 dias",
      tone: "brand",
      delta: last7Snapshot.ctr,
    },
    {
      id: "cpc",
      label: "CPC promedio",
      value: formatCurrency(aggregate.cpc),
      helper: "Costo por click medio",
      tone: "neutral",
      delta: last7Snapshot.cpc,
    },
    {
      id: "best-day",
      label: "Mejor dia",
      value: model.aggregate.bestDay ? `${model.aggregate.bestDay.dateLabel} - ${formatInteger(model.aggregate.bestDay.reach)}` : "-",
      helper: "Dia con mayor reach dentro del rango",
      tone: "success",
      delta: model.aggregate.bestDay ? 100 : 0,
    },
  ];

  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">{kpis.map((item) => <KpiCard key={item.id} datum={item} />)}</div>;
}
