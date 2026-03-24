"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Send } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DashboardComment } from "@/types/dashboard";

type CommentsPanelProps = {
  comments: DashboardComment[];
  onSubmit: (body: string) => void;
};

export function CommentsPanel({ comments, onSubmit }: CommentsPanelProps) {
  const [value, setValue] = useState("");

  const sorted = useMemo(
    () => [...comments].sort((left, right) => left.createdAt.localeCompare(right.createdAt)),
    [comments],
  );

  return (
    <div className="flex h-[460px] flex-col">
      <ScrollArea className="h-[360px] px-5 py-4">
        <div className="space-y-4">
          {sorted.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-[var(--text-secondary)]">
              Sin comentarios todavia. Deja feedback sobre este widget para colaborar con el equipo.
            </div>
          ) : null}

          {sorted.map((comment) => (
            <article key={comment.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback style={{ backgroundColor: comment.color }}>{comment.author.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{comment.author}</p>
                    <span className="text-xs text-[var(--text-muted)]">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{comment.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-white/8 p-5">
        <form
          className="flex gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!value.trim()) {
              return;
            }
            onSubmit(value.trim());
            setValue("");
          }}
        >
          <Input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Escribe un comentario para este widget..." />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
