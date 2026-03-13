import { NextResponse } from "next/server";
import { rerunTodayNotionSync } from "@/lib/services/daily-generator";

export const runtime = "nodejs";

export async function POST() {
  try {
    const result = await rerunTodayNotionSync();

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
