import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/env";
import { runDailyGeneration } from "@/lib/services/daily-generator";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const config = getConfig();
  const secretFromQuery = request.nextUrl.searchParams.get("secret");
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.replace("Bearer ", "");
  const secretHeader = request.headers.get("x-notion-button-secret");
  const isAuthorized =
    Boolean(config.notionButtonSecret) &&
    [secretFromQuery, bearerToken, secretHeader].some(
      (candidate) => candidate && candidate === config.notionButtonSecret,
    );

  if (!isAuthorized) {
    return NextResponse.json(
      {
        ok: false,
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  try {
    const result = await runDailyGeneration();

    return NextResponse.json({
      ok: true,
      duplicate: result.duplicate,
      message: result.message,
      routineId: result.routine.id,
      date: result.routine.date,
      theme: result.routine.theme,
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
