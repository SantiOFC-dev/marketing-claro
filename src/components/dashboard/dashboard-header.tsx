"use client";

import { BarChart3, Download, LayoutPanelTop, RefreshCcw, SlidersHorizontal, Sparkles, TrendingUp, Users } from "lucide-react";
import { allCampaignOption } from "@/data/mock/accounts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PresenceStrip } from "./presence-strip";
import { WidgetManager } from "./widget-manager";
import { formatCompactNumber, formatCurrency, formatPercent } from "@/lib/utils";
import type { Account, ComparisonMode, DashboardFilters, DashboardModel, DashboardUserProfile, DashboardWidget, DrilldownSelection, WidgetType } from "@/types/dashboard";

type DashboardHeaderProps = {
  accounts: Account[];
  activeAccount: Account;
  filters: DashboardFilters;
  widgets: DashboardWidget[];
  model: DashboardModel;
  userProfile: DashboardUserProfile;
  selection: DrilldownSelection;
  onFiltersChange: (filters: Partial<DashboardFilters>) => void;
  onResetLayout: () => void;
  onToggleWidget: (widgetId: string) => void;
  onPinWidget: (widgetId: string) => void;
  onRestoreWidgets: () => void;
  onAddWidget: (type: WidgetType) => void;
  onUserProfileChange: (profile: Partial<DashboardUserProfile>) => void;
  onResetScope: () => void;
};

const comparisonLabels: Record<ComparisonMode, string> = {
  previous: "Periodo anterior",
  yesterday: "Vs ayer",
  seven_days: "Vs 7 dias",
};

export function DashboardHeader({ accounts, activeAccount, filters, widgets, model, userProfile, selection, onFiltersChange, onResetLayout, onToggleWidget, onPinWidget, onRestoreWidgets, onAddWidget, onUserProfileChange, onResetScope }: DashboardHeaderProps) {
  const scopeActive = Boolean(selection.campaignId || selection.adSetId || selection.adId);
  return (
    <div className="app-panel overflow-hidden rounded-[28px]">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/8 bg-[var(--app-toolbar)] px-5 py-3 text-sm">
        <button className="fb-tab fb-tab-active rounded-xl px-3 py-2 font-medium">Campanas</button>
        <button className="fb-tab rounded-xl px-3 py-2 font-medium">Conjuntos</button>
        <button className="fb-tab rounded-xl px-3 py-2 font-medium">Anuncios</button>
        <div className="mx-2 hidden h-6 w-px bg-white/8 md:block" />
        <div className="fb-toolbar-chip text-xs text-[var(--text-secondary)]"><Users className="h-3.5 w-3.5 text-[var(--brand)]" /> {activeAccount.campaigns.length} campanas activas</div>
        <div className="fb-toolbar-chip text-xs text-[var(--text-secondary)]"><TrendingUp className="h-3.5 w-3.5 text-emerald-300" /> Reach {formatCompactNumber(model.aggregate.reach)}</div>
        <div className="fb-toolbar-chip text-xs text-[var(--text-secondary)]"><BarChart3 className="h-3.5 w-3.5 text-amber-300" /> Spend {formatCurrency(model.aggregate.spend)}</div>
      </div>

      <div className="p-5">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge tone="brand" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Ads Command Center
            </Badge>
            <Badge tone="neutral">Layout editable</Badge>
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Dashboard colaborativo estilo Ads Manager</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
              Simulacion automatica de reach, spend y leads con curva intradia, comparativas listas para crecer hacia Meta Ads API.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--text-secondary)]">
              <span className="fb-toolbar-chip">CTR medio {formatPercent(model.aggregate.ctr)}</span>
              <span className="fb-toolbar-chip">CPC medio {formatCurrency(model.aggregate.cpc)}</span>
              <span className="fb-toolbar-chip">Leads {formatCompactNumber(model.aggregate.leads)}</span>
            </div>
          </div>
          <PresenceStrip />
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-[920px] xl:grid-cols-5">
          <div className="space-y-2 sm:col-span-2 xl:col-span-1">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Analista</p>
            <Input
              value={userProfile.name}
              onChange={(event) =>
                onUserProfileChange({
                  name: event.target.value,
                  id: event.target.value.toLowerCase().replace(/\s+/g, "-") || "analyst",
                })
              }
              placeholder="Nombre del analista"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Desde</p>
            <Input type="date" value={filters.dateFrom} onChange={(event) => onFiltersChange({ dateFrom: event.target.value })} />
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Hasta</p>
            <Input type="date" value={filters.dateTo} onChange={(event) => onFiltersChange({ dateTo: event.target.value })} />
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Cuenta</p>
            <Select value={filters.accountId} onValueChange={(value) => onFiltersChange({ accountId: value, campaignId: "all" })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Campana</p>
            <Select value={filters.campaignId} onValueChange={(value) => onFiltersChange({ campaignId: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={allCampaignOption.id}>{allCampaignOption.label}</SelectItem>
                {activeAccount.campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>{campaign.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-white/8 pt-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral" className="gap-1.5"><SlidersHorizontal className="h-3.5 w-3.5" /> {comparisonLabels[filters.comparisonMode]}</Badge>
          <Select value={filters.comparisonMode} onValueChange={(value) => onFiltersChange({ comparisonMode: value as ComparisonMode })}>
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="previous">Periodo anterior</SelectItem>
              <SelectItem value="yesterday">Vs ayer</SelectItem>
              <SelectItem value="seven_days">Vs 7 dias</SelectItem>
            </SelectContent>
          </Select>
          <Badge tone="brand">{widgets.filter((widget) => !widget.hidden).length} widgets visibles</Badge>
          {scopeActive ? <Badge tone="warning">Scope filtrado activo</Badge> : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={userProfile.provider} onValueChange={(value) => onUserProfileChange({ provider: value as DashboardUserProfile["provider"] })}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mock-meta">Mock Meta API</SelectItem>
              <SelectItem value="graph-meta">Graph API stub</SelectItem>
            </SelectContent>
          </Select>
          <WidgetManager widgets={widgets} onToggle={onToggleWidget} onPin={onPinWidget} onRestore={onRestoreWidgets} onAdd={onAddWidget} />
          <Button variant="outline" onClick={onResetScope} disabled={!scopeActive}>Reset scope</Button>
          <Button variant="outline" onClick={onResetLayout}><RefreshCcw className="h-4 w-4" /> Reset layout</Button>
          <Button variant="outline"><LayoutPanelTop className="h-4 w-4" /> Guardado automatico</Button>
          <Button variant="ghost" disabled><Download className="h-4 w-4" /> Export CSV pronto</Button>
        </div>
      </div>
      </div>
    </div>
  );
}
