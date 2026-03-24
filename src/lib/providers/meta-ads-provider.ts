import { mockAccounts } from "@/data/mock/accounts";
import { buildDashboardModel } from "@/lib/simulation/reports";
import type { Account, DashboardDataProvider, DashboardFilters, DashboardModel } from "@/types/dashboard";

export interface MetaAdsProvider {
  key: DashboardDataProvider;
  getAccounts(): Promise<Account[]>;
  getInsights(filters: DashboardFilters): Promise<DashboardModel>;
}

export const mockMetaAdsProvider: MetaAdsProvider = {
  key: "mock-meta",
  async getAccounts() {
    return mockAccounts;
  },
  async getInsights(filters) {
    return buildDashboardModel({
      filters,
      accounts: mockAccounts,
      now: new Date(),
    });
  },
};

export const graphMetaAdsProvider: MetaAdsProvider = {
  key: "graph-meta",
  async getAccounts() {
    throw new Error("graph_meta_not_configured");
  },
  async getInsights() {
    throw new Error("graph_meta_not_configured");
  },
};

const providers: Record<DashboardDataProvider, MetaAdsProvider> = {
  "mock-meta": mockMetaAdsProvider,
  "graph-meta": graphMetaAdsProvider,
};

export function getMetaAdsProvider(provider: DashboardDataProvider) {
  return providers[provider] ?? mockMetaAdsProvider;
}
