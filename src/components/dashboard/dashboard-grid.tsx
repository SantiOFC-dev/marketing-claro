"use client";

import dynamic from "next/dynamic";
import { Responsive, type ResponsiveLayouts } from "react-grid-layout";
import { WidthProvider } from "react-grid-layout/legacy";
import { buildFunnel } from "@/lib/simulation/reports";
import type { DashboardComment, DashboardLayouts, DashboardModel, DashboardWidget, DrilldownSelection } from "@/types/dashboard";
import { WidgetShell } from "./widget-shell";

const KpiGrid = dynamic(() => import("./kpi-grid").then((mod) => mod.KpiGrid), {
  loading: () => <WidgetLoading />,
});
const LineChartWidget = dynamic(() => import("./charts/line-chart-widget").then((mod) => mod.LineChartWidget), {
  loading: () => <WidgetLoading />,
});
const FunnelWidget = dynamic(() => import("./charts/funnel-widget").then((mod) => mod.FunnelWidget), {
  loading: () => <WidgetLoading />,
});
const BreakdownWidget = dynamic(() => import("./charts/breakdown-widget").then((mod) => mod.BreakdownWidget), {
  loading: () => <WidgetLoading />,
});
const CampaignDrilldownWidget = dynamic(() => import("./campaign-drilldown-widget").then((mod) => mod.CampaignDrilldownWidget), {
  loading: () => <WidgetLoading />,
});
const DataTableWidget = dynamic(() => import("./data-table-widget").then((mod) => mod.DataTableWidget), {
  loading: () => <WidgetLoading />,
});

const ResponsiveGridLayout = WidthProvider(Responsive);

type DashboardGridProps = {
  model: DashboardModel;
  widgets: DashboardWidget[];
  comments: Record<string, DashboardComment[]>;
  layouts: DashboardLayouts;
  onLayoutsChange: (layouts: DashboardLayouts) => void;
  onHideWidget: (widgetId: string) => void;
  onDuplicateWidget: (widgetId: string) => void;
  onComment: (widgetId: string, body: string) => void;
  selection: DrilldownSelection;
  onSelectionChange: (selection: DrilldownSelection) => void;
};

export function DashboardGrid({ model, widgets, comments, layouts, onLayoutsChange, onHideWidget, onDuplicateWidget, onComment, selection, onSelectionChange }: DashboardGridProps) {
  const visibleWidgets = widgets
    .filter((widget) => !widget.hidden)
    .sort((left, right) => Number(right.pinned ?? false) - Number(left.pinned ?? false));

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts as unknown as ResponsiveLayouts}
      breakpoints={{ lg: 1200, md: 768, sm: 0 }}
      cols={{ lg: 12, md: 10, sm: 1 }}
      rowHeight={120}
      margin={[16, 16]}
      onLayoutChange={(_currentLayout: unknown, allLayouts: unknown) => onLayoutsChange(allLayouts as DashboardLayouts)}
    >
      {visibleWidgets.map((widget) => (
        <div key={widget.id}>
          <WidgetShell
            widget={widget}
            comments={comments[widget.id] ?? []}
            onHide={() => onHideWidget(widget.id)}
            onDuplicate={() => onDuplicateWidget(widget.id)}
            onComment={(body) => onComment(widget.id, body)}
          >
            {widget.type === "kpis" ? <KpiGrid model={model} /> : null}
            {widget.type === "reach-line" ? <LineChartWidget data={model.chartPoints} metric="reach" /> : null}
            {widget.type === "spend-line" ? <LineChartWidget data={model.chartPoints} metric="spend" /> : null}
            {widget.type === "leads-line" ? <LineChartWidget data={model.chartPoints} metric="leads" /> : null}
            {widget.type === "funnel" ? <FunnelWidget data={buildFunnel(model.aggregate)} /> : null}
            {widget.type === "breakdown" ? <BreakdownWidget data={model.breakdown} /> : null}
            {widget.type === "campaign-drilldown" ? <CampaignDrilldownWidget drilldowns={model.drilldowns} selection={selection} onSelectionChange={onSelectionChange} /> : null}
            {widget.type === "table" ? <DataTableWidget rows={model.rows} /> : null}
          </WidgetShell>
        </div>
      ))}
    </ResponsiveGridLayout>
  );
}

function WidgetLoading() {
  return <div className="h-[240px] animate-pulse rounded-2xl bg-white/[0.04]" />;
}
