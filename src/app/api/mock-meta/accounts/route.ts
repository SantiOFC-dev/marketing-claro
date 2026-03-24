import { NextResponse } from "next/server";
import { getMetaAdsProvider } from "@/lib/providers/meta-ads-provider";
import type { DashboardDataProvider } from "@/types/dashboard";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provider = (searchParams.get("provider") as DashboardDataProvider | null) ?? "mock-meta";
  const adapter = getMetaAdsProvider(provider);

  return NextResponse.json({
    provider: adapter.key,
    accounts: await adapter.getAccounts(),
  });
}
