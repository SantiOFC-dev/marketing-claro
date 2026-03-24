"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createDefaultFilters, createDefaultLayouts, createDefaultUserProfile, createDefaultWidgets, createWidgetDefinition, createWidgetLayoutItem, DASHBOARD_STORAGE_KEY, duplicateWidgetDefinition, defaultComments } from "@/lib/dashboard/defaults";
import { fetchProviderAccounts, fetchProviderInsights } from "@/lib/api/mock-meta";
import { mockAccounts } from "@/data/mock/accounts";
import { buildDashboardModel } from "@/lib/simulation/reports";
import { mergeStoredView } from "@/lib/persistence/local-storage";
import { generateId } from "@/lib/utils";
import type { Account, DashboardComment, DashboardFilters, DashboardLayouts, DashboardModel, DashboardUserProfile, DashboardWidget, StoredDashboardView, WidgetType } from "@/types/dashboard";
import { useLocalStorageState } from "./use-local-storage";

const defaultView: StoredDashboardView = {
  dashboardId: "dashboard-main",
  userId: createDefaultUserProfile().id,
  filters: createDefaultFilters(),
  layouts: createDefaultLayouts(),
  widgets: createDefaultWidgets(),
  comments: defaultComments(),
};

const DASHBOARD_USER_KEY = `${DASHBOARD_STORAGE_KEY}:user`;

function shiftLayoutItem<T extends { x: number; y: number }>(item: T) {
  return { ...item, x: item.x + 1, y: item.y + 1 };
}

export function useDashboardState(now: Date) {
  const [view, setView, hydrated] = useLocalStorageState(DASHBOARD_STORAGE_KEY, defaultView);
  const [userProfile, setUserProfile] = useLocalStorageState<DashboardUserProfile>(DASHBOARD_USER_KEY, createDefaultUserProfile());
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [serverReady, setServerReady] = useState(false);
  const hasLoadedServer = useRef(false);
  const saveTimer = useRef<number | null>(null);
  const [remoteModel, setRemoteModel] = useState<DashboardModel | null>(null);

  const activeAccount = useMemo(
    () => accounts.find((item) => item.id === view.filters.accountId) ?? accounts[0] ?? mockAccounts[0],
    [accounts, view.filters.accountId],
  );

  const model = useMemo(
    () =>
      remoteModel ??
      buildDashboardModel({
        filters: view.filters,
        accounts,
        now,
      }),
    [accounts, now, remoteModel, view.filters],
  );

  const visibleWidgets = view.widgets.filter((widget) => !widget.hidden);

  useEffect(() => {
    void fetchProviderAccounts(userProfile.provider).then(setAccounts).catch(() => undefined);
  }, [userProfile.provider]);

  useEffect(() => {
    void fetchProviderInsights(userProfile.provider, view.filters)
      .then((payload) => setRemoteModel(payload.model as DashboardModel))
      .catch(() => setRemoteModel(null));
  }, [userProfile.provider, view.filters]);

  useEffect(() => {
    setView((current) => {
      if (current.userId === userProfile.id) {
        return current;
      }

      hasLoadedServer.current = false;
      setServerReady(false);
      return { ...current, userId: userProfile.id };
    });
  }, [setView, userProfile.id]);

  useEffect(() => {
    if (hasLoadedServer.current) {
      return;
    }

    hasLoadedServer.current = true;

    void fetch(`/api/dashboard-view?dashboardId=${view.dashboardId ?? "dashboard-main"}&userId=${view.userId ?? userProfile.id}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("load_failed");
        }

        const payload = (await response.json()) as { view: StoredDashboardView };
        setView((current) => mergeStoredView(current, payload.view));
      })
      .catch(() => undefined)
      .finally(() => setServerReady(true));
  }, [setView, userProfile.id, view.dashboardId, view.userId]);

  useEffect(() => {
    if (!hydrated || !serverReady) {
      return;
    }

    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
    }

    saveTimer.current = window.setTimeout(() => {
      void fetch("/api/dashboard-view", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dashboardId: view.dashboardId ?? "dashboard-main",
          userId: view.userId ?? userProfile.id,
          view,
        }),
      }).catch(() => undefined);
    }, 600);

    return () => {
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
      }
    };
  }, [hydrated, serverReady, userProfile.id, view]);

  const setFilters = (nextFilters: Partial<DashboardFilters>) => {
    setView((current) => ({
      ...current,
      filters: {
        ...current.filters,
        ...nextFilters,
      },
    }));
  };

  const setLayouts = (layouts: DashboardLayouts) => {
    setView((current) => ({ ...current, layouts }));
  };

  const replaceWidgets = (widgets: DashboardWidget[]) => {
    setView((current) => ({ ...current, widgets }));
  };

  const toggleWidget = (widgetId: string) => {
    replaceWidgets(
      view.widgets.map((widget) =>
        widget.id === widgetId ? { ...widget, hidden: !widget.hidden } : widget,
      ),
    );
  };

  const pinWidget = (widgetId: string) => {
    replaceWidgets(
      [...view.widgets]
        .map((widget) =>
          widget.id === widgetId ? { ...widget, pinned: !widget.pinned } : widget,
        )
        .sort((left, right) => Number(right.pinned ?? false) - Number(left.pinned ?? false)),
    );
  };

  const restoreWidgets = () => {
    replaceWidgets(view.widgets.map((widget) => ({ ...widget, hidden: false })));
  };

  const createWidget = (type: WidgetType) => {
    const widget = createWidgetDefinition(type);
    const nextLayouts = Object.fromEntries(
      Object.entries(view.layouts).map(([breakpoint, items]) => [breakpoint, [...items, createWidgetLayoutItem(widget.id, type)]]),
    ) as DashboardLayouts;
    const nextWidgets = [...view.widgets, widget];

    setView((current) => ({
      ...current,
      widgets: nextWidgets,
      layouts: nextLayouts,
    }));

    return { widget, layouts: nextLayouts, widgets: nextWidgets };
  };

  const duplicateWidget = (widgetId: string) => {
    const targetWidget = view.widgets.find((widget) => widget.id === widgetId);
    if (!targetWidget) {
      return;
    }

    const duplicatedWidget = duplicateWidgetDefinition(targetWidget);
    const nextLayouts = Object.fromEntries(
      Object.entries(view.layouts).map(([breakpoint, items]) => {
        const source = items.find((item) => item.i === widgetId);
        const nextItem = source
          ? { ...shiftLayoutItem(source), i: duplicatedWidget.id }
          : { i: duplicatedWidget.id, x: 0, y: 0, w: 4, h: 4 };
        return [breakpoint, [...items, nextItem]];
      }),
    ) as DashboardLayouts;
    const nextWidgets = [...view.widgets, duplicatedWidget];

    setView((current) => ({
      ...current,
      widgets: nextWidgets,
      layouts: nextLayouts,
    }));

    return { widget: duplicatedWidget, layouts: nextLayouts, widgets: nextWidgets };
  };

  const resetLayout = () => {
    setView(defaultView);
  };

  const addComment = (widgetId: string, author: string, color: string, body: string) => {
    const comment: DashboardComment = {
      id: generateId("comment"),
      widgetId,
      author,
      color,
      body,
      createdAt: new Date().toISOString(),
    };

    setView((current) => ({
      ...current,
      comments: {
        ...current.comments,
        [widgetId]: [...(current.comments[widgetId] ?? []), comment],
      },
    }));

    void fetch("/api/dashboard-comment", {
      method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dashboardId: view.dashboardId ?? "dashboard-main",
          userId: view.userId ?? userProfile.id,
          comment,
        }),
      }).catch(() => undefined);

    return comment;
  };

  const receiveComment = (comment: DashboardComment) => {
    setView((current) => {
      const existing = current.comments[comment.widgetId] ?? [];
      if (existing.some((item) => item.id === comment.id)) {
        return current;
      }

      return {
        ...current,
        comments: {
          ...current.comments,
          [comment.widgetId]: [...existing, comment],
        },
      };
    });
  };

  return {
    hydrated,
    accounts,
    userProfile,
    activeAccount,
    filters: view.filters,
    model,
    widgets: view.widgets,
    visibleWidgets,
    layouts: view.layouts,
    comments: view.comments,
    persistence: {
      hydrated,
      serverReady,
    },
    setFilters,
    setLayouts,
    replaceWidgets,
    toggleWidget,
    pinWidget,
    restoreWidgets,
    createWidget,
    duplicateWidget,
    resetLayout,
    addComment,
    receiveComment,
    updateUserProfile: (nextProfile: Partial<DashboardUserProfile>) =>
      setUserProfile((current) => ({ ...current, ...nextProfile })),
  };
}
