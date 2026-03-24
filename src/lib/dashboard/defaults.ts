import { mockAccounts } from "@/data/mock/accounts";
import { generateId } from "@/lib/utils";
import { recommendedDateRange } from "@/lib/simulation/reports";
import type { DashboardComment, DashboardFilters, DashboardLayouts, DashboardUserProfile, DashboardWidget, WidgetType } from "@/types/dashboard";

export const DASHBOARD_STORAGE_KEY = "ads-command-center:v1";

export function createDefaultFilters() {
  const range = recommendedDateRange(new Date());
  const account = mockAccounts[0];

  return {
    accountId: account.id,
    campaignId: "all",
    comparisonMode: "previous",
    ...range,
  } satisfies DashboardFilters;
}

export function createDefaultWidgets(): DashboardWidget[] {
  return [
    {
      id: "widget-kpis",
      type: "kpis",
      title: "Pulse de rendimiento",
      description: "KPIs clave del rango activo",
    },
    {
      id: "widget-reach-line",
      type: "reach-line",
      title: "Reach por dia",
      description: "Evolucion de personas alcanzadas",
    },
    {
      id: "widget-spend-line",
      type: "spend-line",
      title: "Spend por dia",
      description: "Inversion diaria acumulada",
    },
    {
      id: "widget-leads-line",
      type: "leads-line",
      title: "Leads por dia",
      description: "Captacion por jornada",
    },
    {
      id: "widget-funnel",
      type: "funnel",
      title: "Funnel operativo",
      description: "Embudo simplificado del rango",
    },
    {
      id: "widget-breakdown",
      type: "breakdown",
      title: "Breakdown de campanas",
      description: "Comparativo por esfuerzo activo",
    },
    {
      id: "widget-table",
      type: "table",
      title: "Tabla estilo Ads Manager",
      description: "Detalle por fecha y campana",
    },
    {
      id: "widget-campaign-drilldown",
      type: "campaign-drilldown",
      title: "Campaign drill-down",
      description: "Vista detallada por campana con tabla y tendencia",
    },
  ];
}

export function createWidgetBlueprints(): Record<WidgetType, Omit<DashboardWidget, "id">> {
  return {
    kpis: { type: "kpis", title: "Pulse de rendimiento", description: "KPIs clave del rango activo" },
    "reach-line": { type: "reach-line", title: "Reach por dia", description: "Evolucion de personas alcanzadas" },
    "spend-line": { type: "spend-line", title: "Spend por dia", description: "Inversion diaria acumulada" },
    "leads-line": { type: "leads-line", title: "Leads por dia", description: "Captacion por jornada" },
    funnel: { type: "funnel", title: "Funnel operativo", description: "Embudo simplificado del rango" },
    breakdown: { type: "breakdown", title: "Breakdown de campanas", description: "Comparativo por esfuerzo activo" },
    table: { type: "table", title: "Tabla estilo Ads Manager", description: "Detalle por fecha y campana" },
    "campaign-drilldown": { type: "campaign-drilldown", title: "Campaign drill-down", description: "Vista detallada por campana con tabla y tendencia" },
  };
}

export function createDefaultLayouts(): DashboardLayouts {
  return {
    lg: [
      { i: "widget-kpis", x: 0, y: 0, w: 12, h: 3, minH: 3 },
      { i: "widget-reach-line", x: 0, y: 3, w: 6, h: 4, minH: 4 },
      { i: "widget-spend-line", x: 6, y: 3, w: 6, h: 4, minH: 4 },
      { i: "widget-leads-line", x: 0, y: 7, w: 6, h: 4, minH: 4 },
      { i: "widget-funnel", x: 6, y: 7, w: 3, h: 4, minH: 4 },
      { i: "widget-breakdown", x: 9, y: 7, w: 3, h: 4, minH: 4 },
      { i: "widget-campaign-drilldown", x: 0, y: 11, w: 12, h: 5, minH: 5 },
      { i: "widget-table", x: 0, y: 16, w: 12, h: 6, minH: 5 },
    ],
    md: [
      { i: "widget-kpis", x: 0, y: 0, w: 10, h: 4, minH: 4 },
      { i: "widget-reach-line", x: 0, y: 4, w: 10, h: 4, minH: 4 },
      { i: "widget-spend-line", x: 0, y: 8, w: 10, h: 4, minH: 4 },
      { i: "widget-leads-line", x: 0, y: 12, w: 10, h: 4, minH: 4 },
      { i: "widget-funnel", x: 0, y: 16, w: 5, h: 4, minH: 4 },
      { i: "widget-breakdown", x: 5, y: 16, w: 5, h: 4, minH: 4 },
      { i: "widget-campaign-drilldown", x: 0, y: 20, w: 10, h: 5, minH: 5 },
      { i: "widget-table", x: 0, y: 25, w: 10, h: 7, minH: 5 },
    ],
    sm: [
      { i: "widget-kpis", x: 0, y: 0, w: 1, h: 5, minH: 5 },
      { i: "widget-reach-line", x: 0, y: 5, w: 1, h: 4, minH: 4 },
      { i: "widget-spend-line", x: 0, y: 9, w: 1, h: 4, minH: 4 },
      { i: "widget-leads-line", x: 0, y: 13, w: 1, h: 4, minH: 4 },
      { i: "widget-funnel", x: 0, y: 17, w: 1, h: 4, minH: 4 },
      { i: "widget-breakdown", x: 0, y: 21, w: 1, h: 4, minH: 4 },
      { i: "widget-campaign-drilldown", x: 0, y: 25, w: 1, h: 5, minH: 5 },
      { i: "widget-table", x: 0, y: 30, w: 1, h: 7, minH: 5 },
    ],
  };
}

export function duplicateWidgetDefinition(widget: DashboardWidget): DashboardWidget {
  return {
    ...widget,
    id: generateId(widget.type),
    title: `${widget.title} copia`,
  };
}

export function createWidgetDefinition(type: WidgetType): DashboardWidget {
  const blueprint = createWidgetBlueprints()[type];
  return {
    ...blueprint,
    id: generateId(type),
  };
}

export function createWidgetLayoutItem(widgetId: string, type: WidgetType) {
  const map: Record<WidgetType, { w: number; h: number; minH?: number }> = {
    kpis: { w: 12, h: 3, minH: 3 },
    "reach-line": { w: 6, h: 4, minH: 4 },
    "spend-line": { w: 6, h: 4, minH: 4 },
    "leads-line": { w: 6, h: 4, minH: 4 },
    funnel: { w: 3, h: 4, minH: 4 },
    breakdown: { w: 3, h: 4, minH: 4 },
    table: { w: 12, h: 6, minH: 5 },
    "campaign-drilldown": { w: 12, h: 5, minH: 5 },
  };

  return {
    i: widgetId,
    x: 0,
    y: Infinity,
    ...map[type],
  };
}

export function createDefaultUserProfile(): DashboardUserProfile {
  return {
    id: "local-analyst",
    name: "Analyst Mia",
    color: "#4AA8FF",
    provider: "mock-meta",
  };
}

export function defaultComments(): Record<string, DashboardComment[]> {
  return {};
}
