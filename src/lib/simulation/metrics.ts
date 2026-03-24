import { round } from "@/lib/utils";
import type { AdsMetrics } from "@/types/dashboard";
import { rangeRandom, seededRandom } from "./random";

export function deriveAdsMetrics(reach: number, seed: string): AdsMetrics {
  const random = seededRandom(seed);
  const frequency = 1.35 + random() * 1.35;
  const ctrBase = 0.016 + random() * 0.031;
  const leadRate = 0.075 + random() * 0.12;
  const cpcBase = 0.72 + random() * 1.92;
  const spendLift = rangeRandom(`${seed}-spend`, 0.94, 1.12);

  const impressions = Math.max(reach, Math.round(reach * frequency));
  const clicks = Math.round(impressions * ctrBase);
  const leads = Math.max(1, Math.round(clicks * leadRate));
  const spend = round(clicks * cpcBase * spendLift, 2);
  const ctr = impressions === 0 ? 0 : round((clicks / impressions) * 100, 2);
  const cpc = clicks === 0 ? 0 : round(spend / clicks, 2);
  const cpm = impressions === 0 ? 0 : round((spend / impressions) * 1000, 2);
  const cpl = leads === 0 ? 0 : round(spend / leads, 2);

  return {
    reach,
    impressions,
    clicks,
    leads,
    spend,
    ctr,
    cpc,
    cpm,
    cpl,
  };
}

export function emptyMetrics(): AdsMetrics {
  return {
    reach: 0,
    impressions: 0,
    clicks: 0,
    leads: 0,
    spend: 0,
    ctr: 0,
    cpc: 0,
    cpm: 0,
    cpl: 0,
  };
}
