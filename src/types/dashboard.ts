export type MetricKey =
  | "reach"
  | "impressions"
  | "clicks"
  | "leads"
  | "spend"
  | "ctr"
  | "cpc"
  | "cpm"
  | "cpl";

export type DeliveryStatus = "Active" | "Learning" | "Limited";

export type ComparisonMode = "previous" | "yesterday" | "seven_days";

export type WidgetType =
  | "kpis"
  | "reach-line"
  | "spend-line"
  | "leads-line"
  | "funnel"
  | "breakdown"
  | "table"
  | "campaign-drilldown";

export type BreakpointKey = "lg" | "md" | "sm";

export type LayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
};

export type DashboardLayouts = Record<BreakpointKey, LayoutItem[]>;

export type DashboardWidget = {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  hidden?: boolean;
  pinned?: boolean;
};

export type DashboardViewMode = "overview" | "campaigns" | "ads";

export type DashboardDataProvider = "mock-meta" | "graph-meta";

export type DashboardUserProfile = {
  id: string;
  name: string;
  color: string;
  provider: DashboardDataProvider;
};

export type DrilldownSelection = {
  campaignId: string | null;
  adSetId: string | null;
  adId: string | null;
};

export type DashboardComment = {
  id: string;
  widgetId: string;
  author: string;
  body: string;
  color: string;
  createdAt: string;
};

export type DashboardFilters = {
  accountId: string;
  campaignId: string;
  dateFrom: string;
  dateTo: string;
  comparisonMode: ComparisonMode;
};

export type Campaign = {
  id: string;
  accountId: string;
  name: string;
  status: DeliveryStatus;
  weight: number;
};

export type Account = {
  id: string;
  name: string;
  timezone: string;
  campaigns: Campaign[];
};

export type AdsMetrics = {
  reach: number;
  impressions: number;
  clicks: number;
  leads: number;
  spend: number;
  ctr: number;
  cpc: number;
  cpm: number;
  cpl: number;
};

export type DailyReportRow = AdsMetrics & {
  id: string;
  date: string;
  dateLabel: string;
  campaignId: string;
  campaign: string;
  delivery: DeliveryStatus;
  dailyTarget: number;
  progress: number;
  cumulativeReach: number;
};

export type DailySummaryPoint = {
  date: string;
  dateLabel: string;
  reach: number;
  spend: number;
  leads: number;
};

export type BreakdownPoint = {
  campaignId: string;
  campaign: string;
  reach: number;
  spend: number;
  leads: number;
  clicks: number;
  impressions: number;
  ctr: number;
  cpl: number;
  status: DeliveryStatus;
};

export type CampaignDrilldown = {
  campaignId: string;
  campaign: string;
  status: DeliveryStatus;
  summary: AdsMetrics & {
    daysActive: number;
    target: number;
  };
  dailyTrend: DailySummaryPoint[];
  rows: DailyReportRow[];
  adSets: AdSetDrilldown[];
};

export type AdSetDrilldown = {
  adSetId: string;
  adSet: string;
  campaignId: string;
  status: DeliveryStatus;
  summary: AdsMetrics & {
    target: number;
  };
  dailyTrend: DailySummaryPoint[];
  rows: DailyReportRow[];
  ads: AdDrilldown[];
};

export type AdDrilldown = {
  adId: string;
  ad: string;
  adSetId: string;
  campaignId: string;
  status: DeliveryStatus;
  summary: AdsMetrics & {
    target: number;
  };
  dailyTrend: DailySummaryPoint[];
  rows: DailyReportRow[];
};

export type KpiDatum = {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: "brand" | "success" | "warning" | "neutral";
  delta: number;
};

export type DashboardAggregate = AdsMetrics & {
  currentDayReach: number;
  currentDayTarget: number;
  bestDay: DailySummaryPoint | null;
};

export type ComparisonSnapshot = {
  reach: number;
  spend: number;
  leads: number;
  ctr: number;
  cpc: number;
};

export type DashboardModel = {
  rows: DailyReportRow[];
  chartPoints: DailySummaryPoint[];
  breakdown: BreakdownPoint[];
  drilldowns: CampaignDrilldown[];
  aggregate: DashboardAggregate;
  previousSnapshot: ComparisonSnapshot;
  todaySnapshot: ComparisonSnapshot;
  last7Snapshot: ComparisonSnapshot;
};

export type DashboardPresence = {
  name: string;
  color: string;
  activeWidgetId: string | null;
};

export type DashboardEvent =
  | { type: "layout.updated"; layouts: DashboardLayouts; widgets: DashboardWidget[] }
  | { type: "comment.created"; widgetId: string; comment: DashboardComment };

export type StoredDashboardView = {
  dashboardId?: string;
  userId?: string;
  filters: DashboardFilters;
  layouts: DashboardLayouts;
  widgets: DashboardWidget[];
  comments: Record<string, DashboardComment[]>;
};

export type PersistedDashboardPayload = {
  dashboardId: string;
  userId: string;
  view: StoredDashboardView;
};

export type MockMetaResponse = {
  accounts: Account[];
};
