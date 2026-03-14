import { describe, expect, it } from "vitest";
import { calculateAverageScore, calculateStreak, updateReviewItems, upsertDailyProgress } from "@/lib/utils/scoring";
import type { PracticeAttempt } from "@/lib/types";

const attempts: PracticeAttempt[] = [
  {
    id: "a1",
    lessonId: "lesson-1",
    promptId: "p1",
    userId: "user-1",
    answer: "はじめまして",
    inputMode: "text",
    feedback: {
      scores: { naturalness: 80, grammar: 78, vocabulary: 82 },
      overallScore: 80,
      correctedSentence: "はじめまして。",
      naturalAlternative: "はじめまして。よろしくお願いします。",
      explanationKo: "좋아요",
      encouragement: "좋아요",
      matchedExpressions: ["はじめまして"],
      weakExpressions: [],
    },
    createdAt: "2026-03-14T08:00:00.000Z",
  },
  {
    id: "a2",
    lessonId: "lesson-2",
    promptId: "p2",
    userId: "user-1",
    answer: "ありがとうございます",
    inputMode: "text",
    feedback: {
      scores: { naturalness: 70, grammar: 72, vocabulary: 74 },
      overallScore: 72,
      correctedSentence: "ありがとうございます。",
      naturalAlternative: "ありがとうございます。",
      explanationKo: "좋아요",
      encouragement: "좋아요",
      matchedExpressions: ["ありがとうございます"],
      weakExpressions: ["お願いします"],
    },
    createdAt: "2026-03-15T08:00:00.000Z",
  },
];

describe("scoring utilities", () => {
  it("calculates averages", () => {
    expect(calculateAverageScore(attempts)).toBe(76);
  });

  it("creates daily progress and streak summaries", () => {
    const progressDayOne = upsertDailyProgress([], [attempts[0]], "user-1", "2026-03-14");
    const progressDayTwo = upsertDailyProgress(progressDayOne, attempts, "user-1", "2026-03-15");
    const streak = calculateStreak(progressDayTwo, "user-1");

    expect(progressDayTwo).toHaveLength(2);
    expect(streak.bestStreak).toBeGreaterThanOrEqual(2);
  });

  it("updates review states from weak expressions", () => {
    const next = updateReviewItems(
      [],
      [{ expression: "お願いします", meaningKo: "부탁합니다", lessonId: "lesson-2", promptId: "p2" }],
      "user-1",
      58,
      "2026-03-15T08:00:00.000Z",
    );

    expect(next[0]?.state).toBe("weak");
    expect(next[0]?.promptId).toBe("p2");
  });
});
