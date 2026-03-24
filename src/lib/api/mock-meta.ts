import type { Account, DashboardDataProvider, DashboardFilters, DashboardModel } from "@/types/dashboard";

export async function fetchProviderAccounts(provider: DashboardDataProvider): Promise<Account[]> {
  const response = await fetch(`/api/mock-meta/accounts?provider=${provider}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("mock_accounts_failed");
  }

  const payload = (await response.json()) as { accounts: Account[] };
  return payload.accounts;
}

export async function fetchProviderInsights(provider: DashboardDataProvider, filters: DashboardFilters): Promise<{ model: DashboardModel }> {
  const query = new URLSearchParams({ ...filters, provider });
  const response = await fetch(`/api/mock-meta/insights?${query.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("mock_insights_failed");
  }

  return response.json();
}
