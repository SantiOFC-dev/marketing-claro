import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { DashboardComment } from "@/types/dashboard";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { dashboardId?: string; comment: DashboardComment };

  try {
    await prisma.widgetComment.create({
      data: {
        id: body.comment.id,
        dashboardId: body.dashboardId ?? "dashboard-main",
        widgetId: body.comment.widgetId,
        author: body.comment.author,
        body: body.comment.body,
        color: body.comment.color,
        createdAt: new Date(body.comment.createdAt),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to persist comment", detail: String(error) }, { status: 500 });
  }
}
