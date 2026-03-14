import { NextResponse } from "next/server";
import { getPracticeFeedback } from "@/lib/feedbackEngine";
import type { LessonExpression } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    answer: string;
    targetAnswer: string;
    instructionKo: string;
    expressions: LessonExpression[];
  };

  const feedback = await getPracticeFeedback(body);
  return NextResponse.json(feedback);
}
