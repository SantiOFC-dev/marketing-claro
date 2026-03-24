import { NextResponse } from "next/server";
import { Liveblocks } from "@liveblocks/node";

export async function POST() {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;

  if (!secret) {
    return NextResponse.json(
      { error: "LIVEBLOCKS_SECRET_KEY is not configured." },
      { status: 503 },
    );
  }

  const liveblocks = new Liveblocks({ secret });
  const palette = ["#4AA8FF", "#3BDC97", "#FFB648", "#FF8A65", "#8F7CFF"];
  const seed = Math.floor(Math.random() * 9999);
  const session = liveblocks.prepareSession(`viewer-${seed}`, {
    userInfo: {
      name: `Analyst ${seed}`,
      color: palette[seed % palette.length],
    },
  });

  session.allow("dashboard:*", session.FULL_ACCESS);
  const { status, body } = await session.authorize();
  return new NextResponse(body, { status });
}
