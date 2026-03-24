import type { Account } from "@/types/dashboard";

export const mockAccounts: Account[] = [
  {
    id: "acc-north",
    name: "Claro Growth North",
    timezone: "America/Mexico_City",
    campaigns: [
      { id: "cmp-prospecting", accountId: "acc-north", name: "Prospecting LATAM", status: "Active", weight: 0.34 },
      { id: "cmp-retargeting", accountId: "acc-north", name: "Retargeting Core", status: "Learning", weight: 0.22 },
      { id: "cmp-creatives", accountId: "acc-north", name: "Creative Test Burst", status: "Active", weight: 0.19 },
      { id: "cmp-leads", accountId: "acc-north", name: "Lead Form Accelerator", status: "Limited", weight: 0.25 },
    ],
  },
  {
    id: "acc-south",
    name: "Claro Performance South",
    timezone: "America/Bogota",
    campaigns: [
      { id: "cmp-awareness", accountId: "acc-south", name: "Always-On Awareness", status: "Active", weight: 0.38 },
      { id: "cmp-commerce", accountId: "acc-south", name: "Commerce Pulse", status: "Learning", weight: 0.31 },
      { id: "cmp-winback", accountId: "acc-south", name: "Winback Audience", status: "Limited", weight: 0.31 },
    ],
  },
];

export const allCampaignOption = {
  id: "all",
  label: "Todas las campanas",
};
