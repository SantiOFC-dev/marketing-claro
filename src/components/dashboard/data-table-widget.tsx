"use client";

import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type ColumnDef, type SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency, formatInteger, formatPercent } from "@/lib/utils";
import type { DailyReportRow } from "@/types/dashboard";

type DataTableWidgetProps = {
  rows: DailyReportRow[];
};

const deliveryTone = {
  Active: "success",
  Learning: "warning",
  Limited: "danger",
} as const;

export function DataTableWidget({ rows }: DataTableWidgetProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: false }]);

  const columns = useMemo<ColumnDef<DailyReportRow>[]>(
    () => [
      { accessorKey: "dateLabel", header: "Fecha" },
      { accessorKey: "campaign", header: "Campaign" },
      {
        accessorKey: "delivery",
        header: "Delivery",
        cell: ({ row }) => <Badge tone={deliveryTone[row.original.delivery]}>{row.original.delivery}</Badge>,
      },
      { accessorKey: "reach", header: "Reach", cell: ({ row }) => formatInteger(row.original.reach) },
      { accessorKey: "impressions", header: "Impressions", cell: ({ row }) => formatInteger(row.original.impressions) },
      { accessorKey: "clicks", header: "Clicks", cell: ({ row }) => formatInteger(row.original.clicks) },
      { accessorKey: "leads", header: "Leads", cell: ({ row }) => formatInteger(row.original.leads) },
      { accessorKey: "spend", header: "Spend", cell: ({ row }) => formatCurrency(row.original.spend) },
      { accessorKey: "ctr", header: "CTR", cell: ({ row }) => formatPercent(row.original.ctr) },
      { accessorKey: "cpc", header: "CPC", cell: ({ row }) => formatCurrency(row.original.cpc) },
      { accessorKey: "cpl", header: "CPL", cell: ({ row }) => formatCurrency(row.original.cpl) },
      { accessorKey: "cumulativeReach", header: "Total acumulado", cell: ({ row }) => formatInteger(row.original.cumulativeReach) },
    ],
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <ScrollArea className="h-[440px] pt-4">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead className="sticky top-0 z-10 bg-[#101923]/95 backdrop-blur-sm">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="border-b border-white/8 px-3 py-3 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)] first:rounded-tl-xl last:rounded-tr-xl">
                  {header.isPlaceholder ? null : (
                    <button className="transition hover:text-white" onClick={header.column.getToggleSortingHandler()}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="odd:bg-white/[0.022] even:bg-transparent hover:bg-sky-400/[0.05]">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border-b border-white/6 px-3 py-3 text-[13px] text-[var(--text-secondary)]">
                  {cell.column.columnDef.cell
                    ? flexRender(cell.column.columnDef.cell, cell.getContext())
                    : String(cell.getValue() ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  );
}
