"use client";

import { BarChart3, BriefcaseBusiness, FolderKanban, Home, Layers3, Megaphone, MessageCircleMore, Settings, Users2 } from "lucide-react";
import { cn } from "@/lib/utils";

type MetaSidebarProps = {
  activeSection: "overview" | "campaigns" | "ads";
  onSectionChange: (section: "overview" | "campaigns" | "ads") => void;
};

const primaryItems = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "campaigns", label: "Campaigns", icon: FolderKanban },
  { id: "ads", label: "Ads", icon: Megaphone },
] as const;

const secondaryItems = [
  { label: "Audiences", icon: Users2 },
  { label: "Reports", icon: BarChart3 },
  { label: "Assets", icon: Layers3 },
  { label: "Inbox", icon: MessageCircleMore },
  { label: "Settings", icon: Settings },
] as const;

export function MetaSidebar({ activeSection, onSectionChange }: MetaSidebarProps) {
  return (
    <aside className="hidden w-[92px] shrink-0 xl:block">
      <div className="app-panel sticky top-[72px] flex min-h-[calc(100vh-92px)] flex-col items-center rounded-[28px] px-3 py-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand)] text-lg font-bold text-slate-950">M</div>
        <div className="mt-6 flex w-full flex-col gap-2">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "group flex flex-col items-center gap-2 rounded-2xl px-2 py-3 text-[11px] font-medium text-[var(--text-muted)] transition",
                  active ? "bg-[var(--brand-soft)] text-white" : "hover:bg-white/[0.04] hover:text-[var(--text-primary)]",
                )}
              >
                <Icon className={cn("h-5 w-5", active ? "text-[var(--brand-2)]" : "text-current")} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 h-px w-10 bg-white/10" />

        <div className="mt-6 flex w-full flex-col gap-2">
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.label} className="flex flex-col items-center gap-2 rounded-2xl px-2 py-3 text-[11px] font-medium text-[var(--text-muted)] transition hover:bg-white/[0.04] hover:text-[var(--text-primary)]">
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-auto w-full rounded-2xl border border-white/8 bg-white/[0.03] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
              <BriefcaseBusiness className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">Business</p>
              <p className="truncate text-[11px] text-[var(--text-muted)]">Manager</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
