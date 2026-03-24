import { createClient } from "@liveblocks/client";
import { ClientSideSuspense, createRoomContext } from "@liveblocks/react";
import type { DashboardEvent, DashboardPresence } from "@/types/dashboard";

const client = createClient({
  authEndpoint: "/api/liveblocks-auth",
  throttle: 32,
});

export const {
  RoomProvider,
  useOthers,
  useMyPresence,
  useBroadcastEvent,
  useEventListener,
  useStatus,
} = createRoomContext<DashboardPresence, never, { info: { name: string; color: string } }, DashboardEvent>(client);

export { ClientSideSuspense };
