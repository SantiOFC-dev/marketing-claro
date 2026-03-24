"use client";

import { Copy, EyeOff, MessageSquareMore, Move, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CommentsPanel } from "@/components/dashboard/comments-panel";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { DashboardComment, DashboardWidget } from "@/types/dashboard";

type WidgetShellProps = {
  widget: DashboardWidget;
  comments: DashboardComment[];
  onHide: () => void;
  onDuplicate: () => void;
  onComment: (body: string) => void;
  children: React.ReactNode;
};

export function WidgetShell({ widget, comments, onHide, onDuplicate, onComment, children }: WidgetShellProps) {
  return (
    <Card className="h-full overflow-hidden rounded-[20px] border-white/10">
      <div className="h-1 w-full bg-gradient-to-r from-[var(--brand)] via-sky-300 to-cyan-300" />
      <CardHeader className="border-b border-white/8 bg-white/[0.015] pb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-lg border border-white/8 bg-white/[0.04] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
              <Move className="h-3 w-3" />
              Drag handle
            </span>
            <CardTitle>{widget.title}</CardTitle>
            <Badge tone="neutral" className="gap-1">
              <Move className="h-3 w-3" />
              Drag
            </Badge>
            <Badge tone="brand">{comments.length} comments</Badge>
          </div>
          <CardDescription className="mt-1">{widget.description}</CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <MessageSquareMore className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Comentarios de widget</DialogTitle>
                <DialogDescription>{widget.title} · feedback colaborativo en tiempo real</DialogDescription>
              </DialogHeader>
              <CommentsPanel comments={comments} onSubmit={onComment} />
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicar widget
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onHide}>
                <EyeOff className="mr-2 h-4 w-4" />
                Ocultar widget
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-88px)]">{children}</CardContent>
    </Card>
  );
}
