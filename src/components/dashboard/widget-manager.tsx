"use client";

import { LayoutGrid, Plus, RotateCcw, Star } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createWidgetBlueprints } from "@/lib/dashboard/defaults";
import type { DashboardWidget, WidgetType } from "@/types/dashboard";

type WidgetManagerProps = {
  widgets: DashboardWidget[];
  onToggle: (widgetId: string) => void;
  onPin: (widgetId: string) => void;
  onRestore: () => void;
  onAdd: (type: WidgetType) => void;
};

export function WidgetManager({ widgets, onToggle, onPin, onRestore, onAdd }: WidgetManagerProps) {
  const hiddenCount = widgets.filter((widget) => widget.hidden).length;
  const blueprints = Object.values(createWidgetBlueprints());

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <LayoutGrid className="h-4 w-4" /> Widgets
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gestor de widgets</DialogTitle>
          <DialogDescription>Activa, oculta, fija y restaura paneles desde una sola vista.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between px-5 py-3">
          <Badge tone="neutral">{widgets.length} total</Badge>
          <div className="flex items-center gap-2">
            <Badge tone="warning">{hiddenCount} ocultos</Badge>
            <Button variant="outline" size="sm" onClick={onRestore}>
              <RotateCcw className="h-4 w-4" /> Restaurar
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[420px] px-5 pb-5">
          <div className="space-y-5">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Agregar widget</p>
              <div className="grid gap-3 md:grid-cols-2">
                {blueprints.map((widget) => (
                  <button key={`${widget.type}-add`} onClick={() => onAdd(widget.type)} className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{widget.title}</p>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">{widget.description}</p>
                      </div>
                      <span className="rounded-xl bg-white/6 p-2 text-[var(--brand)]">
                        <Plus className="h-4 w-4" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Estado actual</p>
              <div className="space-y-3">
            {widgets.map((widget) => (
              <div key={widget.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">{widget.title}</p>
                    {widget.pinned ? <Badge tone="brand">Pinned</Badge> : null}
                    {widget.hidden ? <Badge tone="warning">Oculto</Badge> : <Badge tone="success">Visible</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">{widget.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onPin(widget.id)}>
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onToggle(widget.id)}>
                    {widget.hidden ? "Mostrar" : "Ocultar"}
                  </Button>
                </div>
              </div>
            ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
