import { addDays, differenceInCalendarDays, eachDayOfInterval, endOfDay, formatISO, isAfter, isBefore, parseISO, startOfDay, subDays } from "date-fns";
import { formatDay, percentDelta, round } from "@/lib/utils";
import type {
  Account,
  AdDrilldown,
  AdSetDrilldown,
  AdsMetrics,
  BreakdownPoint,
  CampaignDrilldown,
  Campaign,
  ComparisonSnapshot,
  DailyReportRow,
  DailySummaryPoint,
  DashboardAggregate,
  DashboardFilters,
  DashboardModel,
  DrilldownSelection,
} from "@/types/dashboard";
import { getDayProgress } from "./curve";
import { deriveAdsMetrics, emptyMetrics } from "./metrics";
import { rangeRandom } from "./random";

const baseTargets = [600, 800, 720, 950, 680, 880, 760, 1020];

function buildDailyTarget(date: Date, accountId: string, dayIndex: number) {
  const base = baseTargets[dayIndex % baseTargets.length];
  const variation = rangeRandom(`${accountId}-${formatISO(date, { representation: "date" })}-target`, 0.9, 1.14);
  return Math.round(base * variation);
}

function getVisibleValue(date: Date, target: number, now: Date) {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  if (isBefore(now, dayStart)) {
    return 0;
  }

  if (isAfter(now, dayEnd)) {
    return target;
  }

  return Math.round(target * getDayProgress(date, now));
}

function campaignShare(campaign: Campaign, campaigns: Campaign[]) {
  const totalWeight = campaigns.reduce((sum, item) => sum + item.weight, 0);
  return campaign.weight / totalWeight;
}

function aggregateMetrics(rows: AdsMetrics[]): AdsMetrics {
  const totals = rows.reduce(
    (accumulator, row) => ({
      reach: accumulator.reach + row.reach,
      impressions: accumulator.impressions + row.impressions,
      clicks: accumulator.clicks + row.clicks,
      leads: accumulator.leads + row.leads,
      spend: accumulator.spend + row.spend,
    }),
    { reach: 0, impressions: 0, clicks: 0, leads: 0, spend: 0 },
  );

  const ctr = totals.impressions === 0 ? 0 : round((totals.clicks / totals.impressions) * 100, 2);
  const cpc = totals.clicks === 0 ? 0 : round(totals.spend / totals.clicks, 2);
  const cpm = totals.impressions === 0 ? 0 : round((totals.spend / totals.impressions) * 1000, 2);
  const cpl = totals.leads === 0 ? 0 : round(totals.spend / totals.leads, 2);

  return { ...totals, ctr, cpc, cpm, cpl };
}

function buildSnapshot(rows: DailyReportRow[]): ComparisonSnapshot {
  const metrics = aggregateMetrics(rows);
  return {
    reach: metrics.reach,
    spend: metrics.spend,
    leads: metrics.leads,
    ctr: metrics.ctr,
    cpc: metrics.cpc,
  };
}

type BuildOptions = {
  filters: DashboardFilters;
  accounts: Account[];
  now: Date;
};

function buildRowsForWindow(options: BuildOptions): DailyReportRow[] {
  const { filters, accounts, now } = options;
  const account = accounts.find((item) => item.id === filters.accountId) ?? accounts[0];
  const campaigns =
    filters.campaignId === "all"
      ? account.campaigns
      : account.campaigns.filter((campaign) => campaign.id === filters.campaignId);

  const days = eachDayOfInterval({
    start: parseISO(filters.dateFrom),
    end: parseISO(filters.dateTo),
  });

  const rows: DailyReportRow[] = [];
  let cumulativeReach = 0;

  days.forEach((day, dayIndex) => {
    const target = buildDailyTarget(day, account.id, dayIndex);

    campaigns.forEach((campaign) => {
      const share = campaignShare(campaign, account.campaigns);
      const campaignTarget = Math.round(target * share);
      const visibleReach = getVisibleValue(day, campaignTarget, now);
      const progress = campaignTarget === 0 ? 0 : visibleReach / campaignTarget;
      const metrics = deriveAdsMetrics(visibleReach, `${campaign.id}-${formatISO(day, { representation: "date" })}`);
      cumulativeReach += visibleReach;

      rows.push({
        id: `${campaign.id}-${formatISO(day, { representation: "date" })}`,
        date: formatISO(day, { representation: "date" }),
        dateLabel: formatDay(day),
        campaignId: campaign.id,
        campaign: campaign.name,
        delivery: campaign.status,
        dailyTarget: campaignTarget,
        progress,
        cumulativeReach,
        ...metrics,
      });
    });
  });

  return rows;
}

function buildChartPoints(rows: DailyReportRow[]): DailySummaryPoint[] {
  const grouped = new Map<string, DailySummaryPoint>();

  rows.forEach((row) => {
    const current = grouped.get(row.date) ?? {
      date: row.date,
      dateLabel: row.dateLabel,
      reach: 0,
      spend: 0,
      leads: 0,
    };

    current.reach += row.reach;
    current.spend += row.spend;
    current.leads += row.leads;
    grouped.set(row.date, current);
  });

  return Array.from(grouped.values());
}

function buildBreakdown(rows: DailyReportRow[]): BreakdownPoint[] {
  const grouped = new Map<string, BreakdownPoint>();

  rows.forEach((row) => {
    const current = grouped.get(row.campaignId) ?? {
      campaignId: row.campaignId,
      campaign: row.campaign,
      reach: 0,
      spend: 0,
      leads: 0,
      clicks: 0,
      impressions: 0,
      ctr: 0,
      cpl: 0,
      status: row.delivery,
    };

    current.reach += row.reach;
    current.spend += row.spend;
    current.leads += row.leads;
    current.clicks += row.clicks;
    current.impressions += row.impressions;
    current.ctr = current.impressions === 0 ? 0 : round((current.clicks / current.impressions) * 100, 2);
    current.cpl = current.leads === 0 ? 0 : round(current.spend / current.leads, 2);
    grouped.set(row.campaignId, current);
  });

  return Array.from(grouped.values()).sort((left, right) => right.reach - left.reach);
}

function buildDrilldowns(rows: DailyReportRow[]): CampaignDrilldown[] {
  const campaignIds = Array.from(new Set(rows.map((row) => row.campaignId)));

  return campaignIds.map((campaignId) => {
    const campaignRows = rows.filter((row) => row.campaignId === campaignId);
    const totals = aggregateMetrics(campaignRows);
    const dailyTrend = buildChartPoints(campaignRows);
    const adSets = buildAdSetsForCampaign(campaignRows, campaignId);

    return {
      campaignId,
      campaign: campaignRows[0]?.campaign ?? campaignId,
      status: campaignRows[0]?.delivery ?? "Active",
      summary: {
        ...totals,
        daysActive: dailyTrend.length,
        target: campaignRows.reduce((sum, row) => sum + row.dailyTarget, 0),
      },
      dailyTrend,
      rows: campaignRows,
      adSets,
    };
  });
}

function cloneRowWithMetrics(row: DailyReportRow, id: string, reach: number): DailyReportRow {
  const metrics = deriveAdsMetrics(reach, id);
  return {
    ...row,
    id,
    dailyTarget: Math.round(row.dailyTarget * (reach / Math.max(row.reach || 1, 1))),
    progress: row.progress,
    cumulativeReach: row.cumulativeReach,
    ...metrics,
  };
}

function splitValue(total: number, weights: number[]) {
  const raw = weights.map((weight) => Math.round(total * weight));
  const diff = total - raw.reduce((sum, value) => sum + value, 0);
  if (raw.length > 0) {
    raw[0] += diff;
  }
  return raw;
}

function buildAdSetsForCampaign(rows: DailyReportRow[], campaignId: string): AdSetDrilldown[] {
  const definitions = [
    { id: `${campaignId}-aset-core`, name: "Core Audience", weight: 0.4 },
    { id: `${campaignId}-aset-lookalike`, name: "Lookalike Stack", weight: 0.35 },
    { id: `${campaignId}-aset-retarget`, name: "Retarget Window", weight: 0.25 },
  ];

  const groupedByDate = new Map<string, DailyReportRow[]>();
  rows.forEach((row) => {
    groupedByDate.set(row.date, [...(groupedByDate.get(row.date) ?? []), row]);
  });

  return definitions.map((definition, index) => {
    const adSetRows = Array.from(groupedByDate.values()).flatMap((groupRows) => {
      const row = groupRows[0];
      const weights = definitions.map((item) => item.weight);
      const reaches = splitValue(row.reach, weights);
      return [cloneRowWithMetrics(row, `${definition.id}-${row.date}`, reaches[index])];
    });

    const summary = {
      ...aggregateMetrics(adSetRows),
      target: adSetRows.reduce((sum, row) => sum + row.dailyTarget, 0),
    };

    return {
      adSetId: definition.id,
      adSet: definition.name,
      campaignId,
      status: rows[0]?.delivery ?? "Active",
      summary,
      dailyTrend: buildChartPoints(adSetRows),
      rows: adSetRows,
      ads: buildAdsForAdSet(adSetRows, campaignId, definition.id),
    };
  });
}

function buildAdsForAdSet(rows: DailyReportRow[], campaignId: string, adSetId: string): AdDrilldown[] {
  const definitions = [
    { id: `${adSetId}-ad-video`, name: "Video Hook A", weight: 0.45 },
    { id: `${adSetId}-ad-carousel`, name: "Carousel Social Proof", weight: 0.33 },
    { id: `${adSetId}-ad-static`, name: "Static CTA Variant", weight: 0.22 },
  ];

  return definitions.map((definition, index) => {
    const adRows = rows.map((row) => {
      const reaches = splitValue(row.reach, definitions.map((item) => item.weight));
      return cloneRowWithMetrics(row, `${definition.id}-${row.date}`, reaches[index]);
    });

    return {
      adId: definition.id,
      ad: definition.name,
      adSetId,
      campaignId,
      status: rows[0]?.delivery ?? "Active",
      summary: {
        ...aggregateMetrics(adRows),
        target: adRows.reduce((sum, row) => sum + row.dailyTarget, 0),
      },
      dailyTrend: buildChartPoints(adRows),
      rows: adRows,
    };
  });
}

function buildAggregate(rows: DailyReportRow[], points: DailySummaryPoint[], today: string): DashboardAggregate {
  const metrics = aggregateMetrics(rows);
  const currentDayRows = rows.filter((row) => row.date === today);
  const currentDayReach = currentDayRows.reduce((sum, row) => sum + row.reach, 0);
  const currentDayTarget = currentDayRows.reduce((sum, row) => sum + row.dailyTarget, 0);
  const bestDay = [...points].sort((left, right) => right.reach - left.reach)[0] ?? null;

  return {
    ...metrics,
    currentDayReach,
    currentDayTarget,
    bestDay,
  };
}

function buildAggregateForRows(rows: DailyReportRow[], today: string): DashboardAggregate {
  const points = buildChartPoints(rows);
  return buildAggregate(rows, points, today);
}

function buildSnapshotForRows(rows: DailyReportRow[]): ComparisonSnapshot {
  return buildSnapshot(rows);
}

function buildBreakdownFromDrilldowns(items: Array<{ id: string; name: string; status: BreakdownPoint["status"]; summary: AdsMetrics }>): BreakdownPoint[] {
  return items
    .map((item) => ({
      campaignId: item.id,
      campaign: item.name,
      reach: item.summary.reach,
      spend: item.summary.spend,
      leads: item.summary.leads,
      clicks: item.summary.clicks,
      impressions: item.summary.impressions,
      ctr: item.summary.ctr,
      cpl: item.summary.cpl,
      status: item.status,
    }))
    .sort((left, right) => right.reach - left.reach);
}

export function buildDashboardModel(options: BuildOptions): DashboardModel {
  const rows = buildRowsForWindow(options);
  const chartPoints = buildChartPoints(rows);
  const today = formatISO(options.now, { representation: "date" });
  const aggregate = buildAggregate(rows, chartPoints, today);
  const breakdown = buildBreakdown(rows);
  const drilldowns = buildDrilldowns(rows);

  const currentStart = parseISO(options.filters.dateFrom);
  const currentEnd = parseISO(options.filters.dateTo);
  const daysInRange = differenceInCalendarDays(currentEnd, currentStart) + 1;
  const previousFilters: DashboardFilters = {
    ...options.filters,
    dateFrom: formatISO(subDays(currentStart, daysInRange), { representation: "date" }),
    dateTo: formatISO(subDays(currentEnd, daysInRange), { representation: "date" }),
  };
  const previousRows = buildRowsForWindow({ ...options, filters: previousFilters });

  const yesterdayDate = formatISO(subDays(options.now, 1), { representation: "date" });
  const todaySnapshot = buildSnapshot(rows.filter((row) => row.date === today));
  const yesterdaySnapshot = buildSnapshot(rows.filter((row) => row.date === yesterdayDate));

  const last7Filters: DashboardFilters = {
    ...options.filters,
    dateFrom: formatISO(subDays(parseISO(options.filters.dateTo), 6), { representation: "date" }),
    dateTo: options.filters.dateTo,
  };
  const previous7Filters: DashboardFilters = {
    ...options.filters,
    dateFrom: formatISO(subDays(parseISO(last7Filters.dateFrom), 7), { representation: "date" }),
    dateTo: formatISO(subDays(parseISO(last7Filters.dateTo), 7), { representation: "date" }),
  };

  const last7Rows = buildRowsForWindow({ ...options, filters: last7Filters });
  const previous7Rows = buildRowsForWindow({ ...options, filters: previous7Filters });

  return {
    rows,
    chartPoints,
    breakdown,
    drilldowns,
    aggregate,
    previousSnapshot: buildSnapshot(previousRows),
    todaySnapshot: {
      ...todaySnapshot,
      reach: percentDelta(todaySnapshot.reach, yesterdaySnapshot.reach),
      spend: percentDelta(todaySnapshot.spend, yesterdaySnapshot.spend),
      leads: percentDelta(todaySnapshot.leads, yesterdaySnapshot.leads),
      ctr: percentDelta(todaySnapshot.ctr, yesterdaySnapshot.ctr),
      cpc: percentDelta(todaySnapshot.cpc, yesterdaySnapshot.cpc),
    },
    last7Snapshot: {
      reach: percentDelta(buildSnapshot(last7Rows).reach, buildSnapshot(previous7Rows).reach),
      spend: percentDelta(buildSnapshot(last7Rows).spend, buildSnapshot(previous7Rows).spend),
      leads: percentDelta(buildSnapshot(last7Rows).leads, buildSnapshot(previous7Rows).leads),
      ctr: percentDelta(buildSnapshot(last7Rows).ctr, buildSnapshot(previous7Rows).ctr),
      cpc: percentDelta(buildSnapshot(last7Rows).cpc, buildSnapshot(previous7Rows).cpc),
    },
  };
}

export function buildFunnel(aggregate: AdsMetrics) {
  return [
    { stage: "Reach", value: aggregate.reach },
    { stage: "Impressions", value: aggregate.impressions },
    { stage: "Clicks", value: aggregate.clicks },
    { stage: "Leads", value: aggregate.leads },
  ];
}

export function buildEmptyModel(): DashboardModel {
  const aggregate = { ...emptyMetrics(), currentDayReach: 0, currentDayTarget: 0, bestDay: null };
  const snapshot = { reach: 0, spend: 0, leads: 0, ctr: 0, cpc: 0 };

  return {
    rows: [],
    chartPoints: [],
    breakdown: [],
    drilldowns: [],
    aggregate,
    previousSnapshot: snapshot,
    todaySnapshot: snapshot,
    last7Snapshot: snapshot,
  };
}

export function buildScopedDashboardModel(model: DashboardModel, selection: DrilldownSelection): DashboardModel {
  const today = formatISO(new Date(), { representation: "date" });

  if (!selection.campaignId) {
    return model;
  }

  const campaign = model.drilldowns.find((item) => item.campaignId === selection.campaignId);
  if (!campaign) {
    return model;
  }

  if (selection.adId && selection.adSetId) {
    const adSet = campaign.adSets.find((item) => item.adSetId === selection.adSetId);
    const ad = adSet?.ads.find((item) => item.adId === selection.adId);

    if (ad) {
      const chartPoints = ad.dailyTrend;
      return {
        ...model,
        rows: ad.rows,
        chartPoints,
        breakdown: buildBreakdownFromDrilldowns(
          adSet?.ads.map((item) => ({ id: item.adId, name: item.ad, status: item.status, summary: item.summary })) ?? [],
        ),
        aggregate: buildAggregateForRows(ad.rows, today),
        previousSnapshot: buildSnapshotForRows(ad.rows),
        todaySnapshot: buildSnapshotForRows(ad.rows.filter((row) => row.date === today)),
        last7Snapshot: buildSnapshotForRows(ad.rows.slice(-7)),
      };
    }
  }

  if (selection.adSetId) {
    const adSet = campaign.adSets.find((item) => item.adSetId === selection.adSetId);
    if (adSet) {
      return {
        ...model,
        rows: adSet.rows,
        chartPoints: adSet.dailyTrend,
        breakdown: buildBreakdownFromDrilldowns(
          adSet.ads.map((item) => ({ id: item.adId, name: item.ad, status: item.status, summary: item.summary })),
        ),
        aggregate: buildAggregateForRows(adSet.rows, today),
        previousSnapshot: buildSnapshotForRows(adSet.rows),
        todaySnapshot: buildSnapshotForRows(adSet.rows.filter((row) => row.date === today)),
        last7Snapshot: buildSnapshotForRows(adSet.rows.slice(-7)),
      };
    }
  }

  return {
    ...model,
    rows: campaign.rows,
    chartPoints: campaign.dailyTrend,
    breakdown: buildBreakdownFromDrilldowns(
      campaign.adSets.map((item) => ({ id: item.adSetId, name: item.adSet, status: item.status, summary: item.summary })),
    ),
    aggregate: buildAggregateForRows(campaign.rows, today),
    previousSnapshot: buildSnapshotForRows(campaign.rows),
    todaySnapshot: buildSnapshotForRows(campaign.rows.filter((row) => row.date === today)),
    last7Snapshot: buildSnapshotForRows(campaign.rows.slice(-7)),
  };
}

export function recommendedDateRange(now: Date) {
  return {
    dateFrom: formatISO(subDays(addDays(now, 1), 13), { representation: "date" }),
    dateTo: formatISO(now, { representation: "date" }),
  };
}
