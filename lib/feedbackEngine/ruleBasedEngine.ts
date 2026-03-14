import type { LessonExpression, PracticeFeedback } from "@/lib/types";

type RuleBasedFeedbackInput = {
  answer: string;
  targetAnswer: string;
  instructionKo: string;
  expressions: LessonExpression[];
};

const PARTICLES = ["は", "が", "を", "に", "で", "へ", "と", "も", "から", "まで", "より"] as const;
const POLITE_ENDINGS = ["です", "ます", "ください", "お願いします", "いただけますか", "できますか"] as const;

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[！？!?,.。、「」『』（）()\-[\]"]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function compact(text: string) {
  return normalize(text).replace(/\s+/g, "");
}

function tokenizeJapanese(text: string) {
  return normalize(text)
    .split(/[\s/]+/)
    .flatMap((part) => part.split(/(?=[はがをにでへとも])|(?<=[はがをにでへとも])/))
    .map((token) => token.trim())
    .filter(Boolean);
}

function bigrams(text: string) {
  const compacted = compact(text);
  if (compacted.length <= 1) {
    return compacted ? [compacted] : [];
  }

  const output: string[] = [];
  for (let index = 0; index < compacted.length - 1; index += 1) {
    output.push(compacted.slice(index, index + 2));
  }
  return output;
}

function ratio(numerator: number, denominator: number) {
  if (denominator <= 0) {
    return 0;
  }
  return numerator / denominator;
}

function overlapRatio(answer: string, target: string) {
  const answerTokens = tokenizeJapanese(answer);
  const targetTokens = tokenizeJapanese(target);
  const remaining = [...answerTokens];

  let matched = 0;
  for (const token of targetTokens) {
    const hitIndex = remaining.indexOf(token);
    if (hitIndex >= 0) {
      matched += 1;
      remaining.splice(hitIndex, 1);
    }
  }

  return ratio(matched, targetTokens.length);
}

function bigramSimilarity(answer: string, target: string) {
  const answerBigrams = bigrams(answer);
  const targetBigrams = bigrams(target);
  const remaining = [...answerBigrams];

  let matched = 0;
  for (const token of targetBigrams) {
    const hitIndex = remaining.indexOf(token);
    if (hitIndex >= 0) {
      matched += 1;
      remaining.splice(hitIndex, 1);
    }
  }

  return ratio(matched, targetBigrams.length);
}

function countMatchedExpressions(answer: string, expressions: LessonExpression[]) {
  const normalizedAnswer = compact(answer);

  return expressions.filter((expression) => {
    const expressionText = compact(expression.japanese);
    if (!expressionText) {
      return false;
    }

    if (normalizedAnswer.includes(expressionText)) {
      return true;
    }

    return bigramSimilarity(normalizedAnswer, expressionText) >= 0.72;
  });
}

function particleCoverage(answer: string, target: string) {
  const normalizedAnswer = compact(answer);
  const normalizedTarget = compact(target);
  const targetParticles = PARTICLES.filter((particle) => normalizedTarget.includes(particle));

  if (targetParticles.length === 0) {
    return 1;
  }

  const matched = targetParticles.filter((particle) => normalizedAnswer.includes(particle)).length;
  return ratio(matched, targetParticles.length);
}

function politeEndingCoverage(answer: string, target: string) {
  const normalizedAnswer = compact(answer);
  const normalizedTarget = compact(target);
  const targetEndings = POLITE_ENDINGS.filter((ending) => normalizedTarget.includes(ending));

  if (targetEndings.length === 0) {
    return 1;
  }

  const matched = targetEndings.filter((ending) => normalizedAnswer.includes(ending)).length;
  return ratio(matched, targetEndings.length);
}

function lengthRatio(answer: string, target: string) {
  const answerLength = compact(answer).length;
  const targetLength = compact(target).length;

  if (answerLength === 0 || targetLength === 0) {
    return 0;
  }

  return Math.min(answerLength, targetLength) / Math.max(answerLength, targetLength);
}

function buildExplanation(args: {
  overallScore: number;
  missingExpressions: string[];
  particleScore: number;
  politeScore: number;
}) {
  const { overallScore, missingExpressions, particleScore, politeScore } = args;

  if (overallScore >= 88) {
    return "문장 구성과 핵심 표현이 잘 맞아요. 지금 수준이면 실제 회화에서도 자연스럽게 들립니다.";
  }

  if (missingExpressions.length > 0) {
    return `핵심 표현 ${missingExpressions.slice(0, 2).join(", ")} 쪽이 빠졌어요. 예시 문장처럼 주요 표현을 먼저 고정하면 정확도가 크게 올라갑니다.`;
  }

  if (particleScore < 0.7) {
    return "조사 사용이 조금 아쉬워요. は, を, に, で 같은 연결이 맞아야 뜻이 더 정확하게 전달됩니다.";
  }

  if (politeScore < 0.7) {
    return "상황에 맞는 정중 표현이 약해요. です, ます, お願いします 같은 마무리를 붙여 보세요.";
  }

  return "의미는 대체로 맞지만 표현이 조금 덜 안정적이에요. 예시 문장 순서를 따라가면 더 자연스럽게 들립니다.";
}

function encouragement(score: number) {
  if (score >= 90) {
    return "아주 좋아요. 이 정도면 바로 입 밖으로 꺼내 써도 자연스러워요.";
  }

  if (score >= 75) {
    return "좋아요. 핵심 표현 하나만 더 정확히 붙이면 훨씬 좋아집니다.";
  }

  return "괜찮아요. 짧게라도 정답 문장을 여러 번 따라 말하면 금방 안정됩니다.";
}

export function getRuleBasedFeedback(input: RuleBasedFeedbackInput): PracticeFeedback {
  const normalizedAnswer = normalize(input.answer);
  const normalizedTarget = normalize(input.targetAnswer);
  const exactMatch = compact(normalizedAnswer) === compact(normalizedTarget);

  const tokenScore = overlapRatio(normalizedAnswer, normalizedTarget);
  const charScore = bigramSimilarity(normalizedAnswer, normalizedTarget);
  const lengthScore = lengthRatio(normalizedAnswer, normalizedTarget);
  const particleScore = particleCoverage(normalizedAnswer, normalizedTarget);
  const politeScore = politeEndingCoverage(normalizedAnswer, normalizedTarget);

  const matchedExpressionRows = countMatchedExpressions(normalizedAnswer, input.expressions);
  const matchedExpressions = matchedExpressionRows.map((expression) => expression.japanese);
  const weakExpressions = input.expressions
    .filter((expression) => !matchedExpressions.includes(expression.japanese))
    .map((expression) => expression.japanese);

  const expressionCoverage =
    input.expressions.length > 0 ? matchedExpressions.length / input.expressions.length : 1;

  let vocabularyScore = Math.round(
    18 +
      tokenScore * 32 +
      charScore * 18 +
      expressionCoverage * 24 +
      lengthScore * 8,
  );

  let grammarScore = Math.round(
    18 +
      particleScore * 34 +
      politeScore * 26 +
      charScore * 12 +
      lengthScore * 10,
  );

  let naturalnessScore = Math.round(
    22 +
      charScore * 28 +
      tokenScore * 22 +
      politeScore * 14 +
      lengthScore * 14,
  );

  if (exactMatch) {
    vocabularyScore = 97;
    grammarScore = 96;
    naturalnessScore = 96;
  } else {
    if (weakExpressions.length > 0) {
      vocabularyScore -= Math.min(22, weakExpressions.length * 10);
      naturalnessScore -= Math.min(14, weakExpressions.length * 6);
    }

    if (particleScore < 0.5) {
      grammarScore -= 14;
    }

    if (politeScore < 0.5) {
      grammarScore -= 10;
      naturalnessScore -= 8;
    }

    if (lengthScore < 0.55) {
      vocabularyScore -= 8;
      naturalnessScore -= 10;
    }
  }

  vocabularyScore = Math.max(12, Math.min(97, vocabularyScore));
  grammarScore = Math.max(12, Math.min(96, grammarScore));
  naturalnessScore = Math.max(12, Math.min(96, naturalnessScore));

  const overallScore = exactMatch
    ? 96
    : Math.round(vocabularyScore * 0.38 + grammarScore * 0.34 + naturalnessScore * 0.28);

  return {
    scores: {
      naturalness: naturalnessScore,
      grammar: grammarScore,
      vocabulary: vocabularyScore,
    },
    overallScore,
    correctedSentence: input.targetAnswer,
    naturalAlternative: input.targetAnswer,
    explanationKo: buildExplanation({
      overallScore,
      missingExpressions: weakExpressions,
      particleScore,
      politeScore,
    }),
    encouragement: encouragement(overallScore),
    matchedExpressions,
    weakExpressions,
  };
}
