import type { LessonExpression, PracticeFeedback } from "@/lib/types";

type OptionalLLMInput = {
  answer: string;
  targetAnswer: string;
  instructionKo: string;
  expressions: LessonExpression[];
};

export async function getOptionalLLMFeedback(
  _input: OptionalLLMInput,
): Promise<PracticeFeedback | null> {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  return null;
}
