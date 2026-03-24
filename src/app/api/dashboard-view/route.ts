import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createDefaultFilters, createDefaultLayouts, createDefaultWidgets, defaultComments } from "@/lib/dashboard/defaults";
import type { StoredDashboardView } from "@/types/dashboard";

const DEFAULT_DASHBOARD_ID = "dashboard-main";
const DEFAULT_USER_ID = "local-analyst";

function defaultView(): StoredDashboardView {
  return {
    dashboardId: DEFAULT_DASHBOARD_ID,
    userId: DEFAULT_USER_ID,
    filters: createDefaultFilters(),
    layouts: createDefaultLayouts(),
    widgets: createDefaultWidgets(),
    comments: defaultComments(),
  };
}

export async function GET(request: NextRequest) {
  const dashboardId = request.nextUrl.searchParams.get("dashboardId") ?? DEFAULT_DASHBOARD_ID;
  const userId = request.nextUrl.searchParams.get("userId") ?? DEFAULT_USER_ID;

  try {
    const dashboard = await prisma.dashboard.findUnique({
      where: { id: dashboardId },
      include: {
        views: { where: { userId }, include: { widgetPrefs: true } },
        comments: true,
      },
    });

    if (!dashboard) {
      return NextResponse.json({ dashboardId, userId, view: defaultView() });
    }

    const comments = dashboard.comments.reduce((acc: Record<string, StoredDashboardView["comments"][string]>, comment: { id: string; widgetId: string; author: string; body: string; color: string; createdAt: Date }) => {
      acc[comment.widgetId] = [
        ...(acc[comment.widgetId] ?? []),
        {
          id: comment.id,
          widgetId: comment.widgetId,
          author: comment.author,
          body: comment.body,
          color: comment.color,
          createdAt: comment.createdAt.toISOString(),
        },
      ];
      return acc;
    }, {});

    const currentView = dashboard.views[0];
    const widgetPrefs = currentView?.widgetPrefs ?? [];
    const widgets = (dashboard.widgetsJson as StoredDashboardView["widgets"]).map((widget, index) => {
      const pref = widgetPrefs.find((item: { widgetId: string; hidden: boolean; pinned: boolean; order: number }) => item.widgetId === widget.id);
      return {
        ...widget,
        hidden: pref?.hidden ?? widget.hidden,
        pinned: pref?.pinned ?? widget.pinned,
        _order: pref?.order ?? index,
      };
    }).sort((left, right) => Number((left as { _order?: number })._order ?? 0) - Number((right as { _order?: number })._order ?? 0)).map((widget) => {
      const sortableWidget = widget as StoredDashboardView["widgets"][number] & { _order?: number };
      delete sortableWidget._order;
      return sortableWidget;
    });

    return NextResponse.json({
      dashboardId,
      userId,
      view: {
        dashboardId,
        userId,
        filters: (currentView?.filtersJson as StoredDashboardView["filters"]) ?? (dashboard.filtersJson as StoredDashboardView["filters"]),
        layouts: (currentView?.layoutJson as StoredDashboardView["layouts"]) ?? (dashboard.layoutJson as StoredDashboardView["layouts"]),
        widgets,
        comments,
      } satisfies StoredDashboardView,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load dashboard view", detail: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const body = (await request.json()) as { dashboardId?: string; userId?: string; view: StoredDashboardView };
  const dashboardId = body.dashboardId ?? DEFAULT_DASHBOARD_ID;
  const userId = body.userId ?? DEFAULT_USER_ID;
  const view = body.view;

  try {
    await prisma.dashboard.upsert({
      where: { id: dashboardId },
      create: {
        id: dashboardId,
        name: "Ads Command Center",
        layoutJson: view.layouts,
        configJson: { version: 1, source: "mvp" },
        filtersJson: view.filters,
        widgetsJson: view.widgets,
      },
      update: {
        layoutJson: view.layouts,
        filtersJson: view.filters,
        widgetsJson: view.widgets,
      },
    });

    const dashboardView = await prisma.dashboardView.upsert({
      where: { dashboardId_userId: { dashboardId, userId } },
      create: {
        dashboardId,
        userId,
        layoutJson: view.layouts,
        filtersJson: view.filters,
      },
      update: {
        layoutJson: view.layouts,
        filtersJson: view.filters,
      },
    });

    await prisma.widgetPreference.deleteMany({ where: { viewId: dashboardView.id } });
    await prisma.widgetPreference.createMany({
      data: view.widgets.map((widget, index) => ({
        viewId: dashboardView.id,
        widgetId: widget.id,
        hidden: widget.hidden ?? false,
        pinned: widget.pinned ?? false,
        order: index,
      })),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save dashboard view", detail: String(error) }, { status: 500 });
  }
}
