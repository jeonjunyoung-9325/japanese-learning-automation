import { NextResponse } from "next/server";
import { rerunTodayNotionSync } from "@/lib/services/daily-generator";
import { DailyRoutine } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { routine?: DailyRoutine } | null;
    const result = await rerunTodayNotionSync(body?.routine);

    return NextResponse.json({
      ok: true,
      duplicate: result.duplicate,
      message: result.message,
      routine: result.routine,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        duplicate: false,
        message: detail,
      },
      { status: 500 },
    );
  }
}
