"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Layers3, Megaphone, Target } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatInteger, formatPercent } from "@/lib/utils";
import type { AdDrilldown, AdSetDrilldown, CampaignDrilldown, DrilldownSelection } from "@/types/dashboard";

type CampaignDrilldownWidgetProps = {
  drilldowns: CampaignDrilldown[];
  selection: DrilldownSelection;
  onSelectionChange: (selection: DrilldownSelection) => void;
};

const toneByStatus = {
  Active: "success",
  Learning: "warning",
  Limited: "danger",
} as const;

export function CampaignDrilldownWidget({ drilldowns, selection, onSelectionChange }: CampaignDrilldownWidgetProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState(selection.campaignId ?? drilldowns[0]?.campaignId ?? "");
  const selectedCampaign = useMemo(
    () => drilldowns.find((item) => item.campaignId === selectedCampaignId) ?? drilldowns[0] ?? null,
    [drilldowns, selectedCampaignId],
  );

  const [selectedAdSetId, setSelectedAdSetId] = useState("");
  const [selectedAdId, setSelectedAdId] = useState("");

  const selectedAdSet = selectedCampaign?.adSets.find((item) => item.adSetId === selectedAdSetId) ?? selectedCampaign?.adSets[0] ?? null;
  const selectedAd = selectedAdSet?.ads.find((item) => item.adId === selectedAdId) ?? selectedAdSet?.ads[0] ?? null;

  if (!selectedCampaign || !selectedAdSet || !selectedAd) {
    return <div className="pt-4 text-sm text-[var(--text-secondary)]">No hay campanas disponibles.</div>;
  }

  return (
    <div className="grid gap-4 pt-4 xl:grid-cols-[260px_260px_minmax(0,1fr)]">
      <SelectorColumn
        title="Campanas"
        icon={<Target className="h-4 w-4" />}
        items={drilldowns.map((item) => ({
          id: item.campaignId,
          title: item.campaign,
          subtitle: `${formatInteger(item.summary.reach)} reach · ${formatCurrency(item.summary.spend)}`,
          tone: toneByStatus[item.status],
          badge: item.status,
        }))}
        selectedId={selectedCampaign.campaignId}
        onSelect={(value) => {
          setSelectedCampaignId(value);
          setSelectedAdSetId("");
          setSelectedAdId("");
          onSelectionChange({ campaignId: value, adSetId: null, adId: null });
        }}
      />

      <SelectorColumn
        title="Ad sets"
        icon={<Layers3 className="h-4 w-4" />}
        items={selectedCampaign.adSets.map((item) => ({
          id: item.adSetId,
          title: item.adSet,
          subtitle: `${formatInteger(item.summary.reach)} reach · ${formatInteger(item.summary.leads)} leads`,
          tone: toneByStatus[item.status],
          badge: item.status,
        }))}
        selectedId={selectedAdSet.adSetId}
        onSelect={(value) => {
          setSelectedAdSetId(value);
          const next = selectedCampaign.adSets.find((item) => item.adSetId === value)?.ads[0]?.adId ?? "";
          setSelectedAdId(next);
          onSelectionChange({ campaignId: selectedCampaign.campaignId, adSetId: value, adId: next || null });
        }}
      />

      <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
        <div className="flex flex-col gap-3 border-b border-white/8 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>{selectedCampaign.campaign}</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span>{selectedAdSet.adSet}</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span>{selectedAd.ad}</span>
            </div>
            <h4 className="mt-2 text-lg font-semibold text-white">Drill-down de campaign, ad set y ad</h4>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Navega entre niveles con resumen, tendencia y tabla para cada capa.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="brand">Target {formatInteger(selectedAd.summary.target)}</Badge>
            <Badge tone={toneByStatus[selectedAd.status]}>{selectedAd.status}</Badge>
            <Button variant="outline" size="sm"><Megaphone className="h-4 w-4" /> Vista anuncio</Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {selectedAdSet.ads.map((item) => (
            <button
              key={item.adId}
              onClick={() => {
                setSelectedAdId(item.adId);
                onSelectionChange({ campaignId: selectedCampaign.campaignId, adSetId: selectedAdSet.adSetId, adId: item.adId });
              }}
              className={selectedAd.adId === item.adId ? "rounded-xl border border-[var(--brand)] bg-[var(--brand-soft)] px-3 py-2 text-left" : "rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-left hover:bg-white/[0.05]"}
            >
              <p className="text-sm font-medium text-white">{item.ad}</p>
              <p className="text-xs text-[var(--text-secondary)]">{formatInteger(item.summary.reach)} reach</p>
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <Stat label="Reach" value={formatInteger(selectedAd.summary.reach)} />
          <Stat label="CTR" value={formatPercent(selectedAd.summary.ctr)} />
          <Stat label="CPL" value={formatCurrency(selectedAd.summary.cpl)} />
          <Stat label="Leads" value={formatInteger(selectedAd.summary.leads)} />
        </div>

        <div className="mt-5 h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={selectedAd.dailyTrend} margin={{ top: 8, right: 12, left: -14, bottom: 0 }}>
              <XAxis dataKey="dateLabel" tick={{ fill: "#70849d", fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#70849d", fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => formatInteger(Number(value))} />
              <Tooltip contentStyle={{ background: "#101923", border: "1px solid rgba(148,163,184,0.18)", borderRadius: 16 }} formatter={(value) => formatInteger(Number(value ?? 0))} />
              <Line type="monotone" dataKey="reach" stroke="#4c9fff" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <MetricsTable rows={selectedAd.rows.slice(0, 6)} />
      </div>
    </div>
  );
}

function SelectorColumn({ title, icon, items, selectedId, onSelect }: { title: string; icon: React.ReactNode; items: Array<{ id: string; title: string; subtitle: string; badge: string; tone: "success" | "warning" | "danger" }>; selectedId: string; onSelect: (id: string) => void; }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">{icon}{title}</div>
      {items.map((item) => (
        <button key={item.id} onClick={() => onSelect(item.id)} className={selectedId === item.id ? "w-full rounded-2xl border border-[var(--brand)] bg-[var(--brand-soft)] p-4 text-left" : "w-full rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-left hover:bg-white/[0.05]"}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">{item.subtitle}</p>
            </div>
            <Badge tone={item.tone}>{item.badge}</Badge>
          </div>
        </button>
      ))}
    </div>
  );
}

function MetricsTable({ rows }: { rows: AdDrilldown["rows"] | AdSetDrilldown["rows"] | CampaignDrilldown["rows"] }) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-white/8">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-white/[0.04] text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
          <tr>
            <th className="px-3 py-3">Fecha</th>
            <th className="px-3 py-3">Reach</th>
            <th className="px-3 py-3">Clicks</th>
            <th className="px-3 py-3">Leads</th>
            <th className="px-3 py-3">Spend</th>
            <th className="px-3 py-3">CTR</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-white/6 text-[var(--text-secondary)] odd:bg-white/[0.02]">
              <td className="px-3 py-3">{row.dateLabel}</td>
              <td className="px-3 py-3">{formatInteger(row.reach)}</td>
              <td className="px-3 py-3">{formatInteger(row.clicks)}</td>
              <td className="px-3 py-3">{formatInteger(row.leads)}</td>
              <td className="px-3 py-3">{formatCurrency(row.spend)}</td>
              <td className="px-3 py-3">{formatPercent(row.ctr)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
