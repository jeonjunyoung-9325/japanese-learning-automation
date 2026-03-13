import { NextResponse } from "next/server";
import { syncTodayRoutineProgress } from "@/lib/services/routine-progress";

export const runtime = "nodejs";

export async function POST() {
  try {
    const routine = await syncTodayRoutineProgress();

    if (!routine) {
      return NextResponse.json({
        ok: false,
        message: "오늘 루틴이 아직 없습니다.",
      });
    }

    return NextResponse.json({
      ok: true,
      message: `획득 XP가 ${routine.earnedXp} XP로 동기화되었습니다.`,
      earnedXp: routine.earnedXp,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        message: detail,
      },
      { status: 500 },
    );
  }
}
