import { NextRequest, NextResponse } from "next/server";
import { getMetaAdsProvider } from "@/lib/providers/meta-ads-provider";
import type { DashboardDataProvider, DashboardFilters } from "@/types/dashboard";

export async function GET(request: NextRequest) {
  const provider = (request.nextUrl.searchParams.get("provider") as DashboardDataProvider | null) ?? "mock-meta";
  const adapter = getMetaAdsProvider(provider);
  const accounts = await adapter.getAccounts();
  const accountId = request.nextUrl.searchParams.get("accountId") ?? accounts[0].id;
  const campaignId = request.nextUrl.searchParams.get("campaignId") ?? "all";
  const dateFrom = request.nextUrl.searchParams.get("dateFrom");
  const dateTo = request.nextUrl.searchParams.get("dateTo");
  const comparisonMode = request.nextUrl.searchParams.get("comparisonMode") ?? "previous";

  if (!dateFrom || !dateTo) {
    return NextResponse.json({ error: "dateFrom and dateTo are required" }, { status: 400 });
  }

  const filters: DashboardFilters = {
    accountId,
    campaignId,
    dateFrom,
    dateTo,
    comparisonMode: comparisonMode as "previous" | "yesterday" | "seven_days",
  };
  const model = await adapter.getInsights(filters);

  return NextResponse.json({
    provider: adapter.key,
    model,
  });
}
