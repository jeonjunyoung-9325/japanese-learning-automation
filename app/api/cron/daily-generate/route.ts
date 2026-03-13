import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/env";
import { runDailyGeneration } from "@/lib/services/daily-generator";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const config = getConfig();
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.replace("Bearer ", "");

  if (!config.cronSecret || bearerToken !== config.cronSecret) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runDailyGeneration();
    return NextResponse.json({
      ok: true,
      duplicate: result.duplicate,
      message: result.message,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, message: detail }, { status: 500 });
  }
}
