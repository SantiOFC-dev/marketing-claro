"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, ChevronDown, Search, Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardGrid } from "@/components/dashboard/dashboard-grid";
import { MetaSidebar } from "@/components/dashboard/meta-sidebar";
import { useDashboardState } from "@/hooks/use-dashboard-state";
import { useNow } from "@/hooks/use-now";
import { buildScopedDashboardModel } from "@/lib/simulation/reports";
import { ClientSideSuspense, RoomProvider, useBroadcastEvent, useEventListener, useMyPresence } from "@/lib/liveblocks/context";
import { Button } from "@/components/ui/button";
import type { DashboardComment, DashboardEvent, DashboardLayouts, DashboardViewMode, DashboardWidget, DrilldownSelection } from "@/types/dashboard";

function DashboardSurface() {
  const now = useNow();
  const state = useDashboardState(now);
  const [, updateMyPresence] = useMyPresence();
  const broadcast = useBroadcastEvent();
  const [activeSection, setActiveSection] = useState<DashboardViewMode>("overview");
  const [selection, setSelection] = useState<DrilldownSelection>({ campaignId: null, adSetId: null, adId: null });

  const userIdentity = useMemo(() => {
    return { name: state.userProfile.name, color: state.userProfile.color };
  }, [state.userProfile.color, state.userProfile.name]);

  const scopedModel = useMemo(() => buildScopedDashboardModel(state.model, selection), [selection, state.model]);

  useEffect(() => {
    updateMyPresence({ ...userIdentity, activeWidgetId: null });
  }, [updateMyPresence, userIdentity]);

  useEventListener(({ event }: { event: DashboardEvent | null }) => {
    if (!event) {
      return;
    }

    if (event.type === "layout.updated") {
      state.setLayouts(event.layouts as DashboardLayouts);
      state.replaceWidgets(event.widgets as DashboardWidget[]);
    }

    if (event.type === "comment.created") {
      state.receiveComment(event.comment as DashboardComment);
    }
  });

  const syncLayout = (layouts: DashboardLayouts, widgets = state.widgets) => {
    state.setLayouts(layouts);
    broadcast({ type: "layout.updated", layouts, widgets });
  };

  const hideWidget = (widgetId: string) => {
    const widgets = state.widgets.map((widget) => (widget.id === widgetId ? { ...widget, hidden: !widget.hidden } : widget));
    state.replaceWidgets(widgets);
    broadcast({ type: "layout.updated", layouts: state.layouts, widgets });
  };

  const toggleWidget = (widgetId: string) => {
    const widgets = state.widgets.map((widget) => (widget.id === widgetId ? { ...widget, hidden: !widget.hidden } : widget));
    state.replaceWidgets(widgets);
    broadcast({ type: "layout.updated", layouts: state.layouts, widgets });
  };

  const pinWidget = (widgetId: string) => {
    const widgets = [...state.widgets]
      .map((widget) => (widget.id === widgetId ? { ...widget, pinned: !widget.pinned } : widget))
      .sort((left, right) => Number(right.pinned ?? false) - Number(left.pinned ?? false));
    state.replaceWidgets(widgets);
    broadcast({ type: "layout.updated", layouts: state.layouts, widgets });
  };

  const restoreWidgets = () => {
    const widgets = state.widgets.map((widget) => ({ ...widget, hidden: false }));
    state.replaceWidgets(widgets);
    broadcast({ type: "layout.updated", layouts: state.layouts, widgets });
  };

  const duplicateWidget = (widgetId: string) => {
    const result = state.duplicateWidget(widgetId);
    if (result) {
      broadcast({ type: "layout.updated", layouts: result.layouts, widgets: result.widgets });
    }
  };

  const addWidget = (type: DashboardWidget["type"]) => {
    const result = state.createWidget(type);
    broadcast({ type: "layout.updated", layouts: result.layouts, widgets: result.widgets });
  };

  const commentOnWidget = (widgetId: string, body: string) => {
    const comment = state.addComment(widgetId, userIdentity.name, userIdentity.color, body);
    broadcast({ type: "comment.created", widgetId, comment });
  };

  return (
    <main className="min-h-screen">
      <div className="fb-topbar sticky top-0 z-40">
        <div className="mx-auto flex max-w-[1680px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand)] text-base font-bold text-slate-950">M</div>
            <div>
              <p className="text-sm font-semibold text-white">Meta-style Command Center</p>
              <p className="text-xs text-[var(--text-muted)]">Campaigns · Ads · Reports</p>
            </div>
          </div>
          <div className="hidden flex-1 items-center gap-3 lg:flex">
            <div className="relative max-w-md flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input className="pl-9" placeholder="Buscar dashboards, campanas, widgets..." />
            </div>
            <div className="fb-toolbar-chip text-xs text-[var(--text-secondary)]">Account Center <ChevronDown className="h-3.5 w-3.5" /></div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon"><Bell className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon"><Settings2 className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1680px] gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <MetaSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

        <div className="min-w-0 flex-1 space-y-5">
          <DashboardHeader
            accounts={state.accounts}
            activeAccount={state.activeAccount}
            filters={state.filters}
            widgets={state.widgets}
            model={scopedModel}
            userProfile={state.userProfile}
            selection={selection}
            onFiltersChange={state.setFilters}
            onResetLayout={state.resetLayout}
            onToggleWidget={toggleWidget}
            onPinWidget={pinWidget}
            onRestoreWidgets={restoreWidgets}
            onAddWidget={addWidget}
            onUserProfileChange={state.updateUserProfile}
            onResetScope={() => setSelection({ campaignId: null, adSetId: null, adId: null })}
          />

          <DashboardGrid
            model={scopedModel}
            widgets={state.widgets.filter((widget) => {
              if (activeSection === "overview") return true;
              if (activeSection === "campaigns") return widget.type !== "funnel";
              return ["campaign-drilldown", "table", "kpis"].includes(widget.type);
            })}
            comments={state.comments}
            layouts={state.layouts}
            onLayoutsChange={syncLayout}
            onHideWidget={hideWidget}
            onDuplicateWidget={duplicateWidget}
            onComment={commentOnWidget}
            selection={selection}
            onSelectionChange={setSelection}
          />
        </div>
      </div>
    </main>
  );
}

export function DashboardPage() {
  return (
    <RoomProvider id="dashboard:ads-command-center" initialPresence={{ name: "Analyst", color: "#4AA8FF", activeWidgetId: null }}>
      <ClientSideSuspense fallback={<main className="min-h-screen p-8 text-sm text-[var(--text-secondary)]">Cargando dashboard...</main>}>
        <DashboardSurface />
      </ClientSideSuspense>
    </RoomProvider>
  );
}
