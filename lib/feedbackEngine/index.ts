import type { LessonExpression, PracticeFeedback } from "@/lib/types";
import { getOptionalLLMFeedback } from "@/lib/feedbackEngine/optionalLLMEngine";
import { getRuleBasedFeedback } from "@/lib/feedbackEngine/ruleBasedEngine";

type FeedbackInput = {
  answer: string;
  targetAnswer: string;
  instructionKo: string;
  expressions: LessonExpression[];
};

export async function getPracticeFeedback(input: FeedbackInput): Promise<PracticeFeedback> {
  const llmFeedback = await getOptionalLLMFeedback(input);

  if (llmFeedback) {
    return llmFeedback;
  }

  return getRuleBasedFeedback(input);
}
