import type { StoredDashboardView } from "@/types/dashboard";

export function readLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocalStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function mergeStoredView(base: StoredDashboardView, override?: Partial<StoredDashboardView>) {
  return {
    ...base,
    ...override,
    filters: { ...base.filters, ...override?.filters },
    layouts: override?.layouts ?? base.layouts,
    widgets: override?.widgets ?? base.widgets,
    comments: { ...base.comments, ...override?.comments },
  } satisfies StoredDashboardView;
}
