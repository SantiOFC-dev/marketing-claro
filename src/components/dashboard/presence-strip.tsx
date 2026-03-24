"use client";

import { WifiOff } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useOthers, useStatus } from "@/lib/liveblocks/context";

export function PresenceStrip() {
  const others = useOthers();
  const status = useStatus();

  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-3">
        {others.slice(0, 4).map((other, index) => {
          const participant = other as { id?: unknown; info?: { name?: string; color?: string } };

          return (
          <Avatar key={String(participant.id ?? participant.info?.name ?? index)} className="border border-slate-950/70">
            <AvatarFallback style={{ backgroundColor: participant.info?.color ?? "#334155" }}>
              {participant.info?.name?.slice(0, 2).toUpperCase() ?? "AN"}
            </AvatarFallback>
          </Avatar>
          );
        })}
      </div>

      {status === "connected" ? (
        <Badge tone="success">{others.length + 1} en tiempo real</Badge>
      ) : (
        <Badge tone="warning" className="gap-1">
          <WifiOff className="h-3.5 w-3.5" />
          Colaboracion offline
        </Badge>
      )}
    </div>
  );
}
