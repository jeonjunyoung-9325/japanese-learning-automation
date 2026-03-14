import type { LessonExpression, PracticeFeedback } from "@/lib/types";

type RuleBasedFeedbackInput = {
  answer: string;
  targetAnswer: string;
  instructionKo: string;
  expressions: LessonExpression[];
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[!?.,]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string) {
  return normalize(text).split(" ").filter(Boolean);
}

function overlapScore(answer: string, target: string) {
  const answerTokens = tokenize(answer);
  const targetTokens = tokenize(target);
  const targetSet = new Set(targetTokens);

  if (targetTokens.length === 0) {
    return 0;
  }

  const matched = answerTokens.filter((token) => targetSet.has(token)).length;
  return matched / targetTokens.length;
}

function grammarHeuristic(answer: string) {
  const normalized = normalize(answer);
  let score = 58;

  if (/[ですます]$/.test(normalized) || normalized.endsWith("です") || normalized.endsWith("ます")) {
    score += 18;
  }

  if (normalized.includes("を") || normalized.includes("に") || normalized.includes("で")) {
    score += 12;
  }

  if (normalized.length >= 8) {
    score += 8;
  }

  return Math.min(score, 96);
}

function encouragement(score: number) {
  if (score >= 90) {
    return "아주 좋아요. 실제 회화에서도 바로 쓸 수 있는 답변이에요.";
  }

  if (score >= 75) {
    return "좋아요. 한두 표현만 다듬으면 훨씬 자연스러워져요.";
  }

  return "괜찮아요. 핵심 표현만 붙이면 훨씬 더 전달력이 좋아집니다.";
}

export function getRuleBasedFeedback(input: RuleBasedFeedbackInput): PracticeFeedback {
  const normalizedAnswer = normalize(input.answer);
  const normalizedTarget = normalize(input.targetAnswer);

  const similarity = overlapScore(normalizedAnswer, normalizedTarget);
  const matchedExpressions = input.expressions
    .filter((expression) => normalizedAnswer.includes(normalize(expression.japanese)))
    .map((expression) => expression.japanese);

  const vocabularyScore = Math.min(
    95,
    Math.round(45 + similarity * 35 + matchedExpressions.length * 8),
  );
  const grammarScore = grammarHeuristic(normalizedAnswer);
  const naturalnessScore = Math.min(
    95,
    Math.round(48 + similarity * 32 + (normalizedAnswer.length >= normalizedTarget.length * 0.7 ? 12 : 0)),
  );
  const overallScore = Math.round((vocabularyScore + grammarScore + naturalnessScore) / 3);

  const weakExpressions = input.expressions
    .filter((expression) => !matchedExpressions.includes(expression.japanese))
    .map((expression) => expression.japanese);

  return {
    scores: {
      naturalness: naturalnessScore,
      grammar: grammarScore,
      vocabulary: vocabularyScore,
    },
    overallScore,
    correctedSentence: input.answer.trim().length > 0 ? input.answer.trim() : input.targetAnswer,
    naturalAlternative: input.targetAnswer,
    explanationKo:
      overallScore >= 80
        ? `좋은 답변이에요. "${input.instructionKo}" 상황에서 자연스럽게 들립니다. 핵심 표현을 더 넣으면 더 안정적이에요.`
        : `의미는 전달되지만 목표 표현과 조사가 조금 더 필요해요. 예시 답변처럼 핵심 표현을 넣어 보세요.`,
    encouragement: encouragement(overallScore),
    matchedExpressions,
    weakExpressions,
  };
}
