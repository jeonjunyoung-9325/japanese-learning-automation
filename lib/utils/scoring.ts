import type {
  DailyProgress,
  PracticeAttempt,
  ReviewItem,
  ReviewState,
  Streak,
} from "@/lib/types";
import { getTodayKey } from "@/lib/utils/date";
import { createId } from "@/lib/utils/ids";

function uniqueLessonCount(attempts: PracticeAttempt[]) {
  return new Set(attempts.map((attempt) => attempt.lessonId)).size;
}

export function calculateAverageScore(attempts: PracticeAttempt[]): number {
  if (attempts.length === 0) {
    return 0;
  }

  const total = attempts.reduce((sum, attempt) => sum + attempt.feedback.overallScore, 0);
  return Math.round(total / attempts.length);
}

export function upsertDailyProgress(
  dailyProgress: DailyProgress[],
  attempts: PracticeAttempt[],
  userId: string,
  date = getTodayKey(),
): DailyProgress[] {
  const attemptsForDate = attempts.filter((attempt) => attempt.createdAt.startsWith(date));
  const nextEntry: DailyProgress = {
    id: dailyProgress.find((item) => item.date === date)?.id ?? createId("daily"),
    userId,
    date,
    attemptsCount: attemptsForDate.length,
    completedLessons: uniqueLessonCount(attemptsForDate),
    averageScore: calculateAverageScore(attemptsForDate),
  };

  const rest = dailyProgress.filter((item) => item.date !== date);
  return [...rest, nextEntry].sort((a, b) => a.date.localeCompare(b.date));
}

export function calculateStreak(dailyProgress: DailyProgress[], userId: string): Streak {
  const practicedDates = dailyProgress
    .filter((item) => item.attemptsCount > 0)
    .map((item) => item.date)
    .sort();

  if (practicedDates.length === 0) {
    return {
      id: createId("streak"),
      userId,
      currentStreak: 0,
      bestStreak: 0,
      lastPracticeDate: null,
    };
  }

  let best = 1;
  let current = 1;

  for (let index = 1; index < practicedDates.length; index += 1) {
    const previous = new Date(practicedDates[index - 1]);
    const next = new Date(practicedDates[index]);
    const diff = Math.round((next.getTime() - previous.getTime()) / 86_400_000);

    if (diff === 1) {
      current += 1;
      best = Math.max(best, current);
    } else if (diff > 1) {
      current = 1;
    }
  }

  const today = getTodayKey();
  const lastPracticeDate = practicedDates.at(-1) ?? null;
  const lastDiff =
    lastPracticeDate === null
      ? 99
      : Math.round((new Date(today).getTime() - new Date(lastPracticeDate).getTime()) / 86_400_000);

  return {
    id: createId("streak"),
    userId,
    currentStreak: lastDiff <= 1 ? current : 0,
    bestStreak: best,
    lastPracticeDate,
  };
}

function nextReviewState(score: number, currentState?: ReviewState): ReviewState {
  if (score >= 90) {
    return "mastered";
  }

  if (score >= 75) {
    return "improving";
  }

  if (score >= 60) {
    return currentState === "new" ? "weak" : "improving";
  }

  return "weak";
}

export function updateReviewItems(
  existing: ReviewItem[],
  weakExpressions: Array<{ expression: string; meaningKo: string; lessonId: string }>,
  userId: string,
  score: number,
  updatedAt: string,
): ReviewItem[] {
  const next = [...existing];

  weakExpressions.forEach((item) => {
    const index = next.findIndex((review) => review.expression === item.expression);

    if (index >= 0) {
      next[index] = {
        ...next[index],
        meaningKo: item.meaningKo,
        lessonId: item.lessonId,
        lastScore: score,
        state: nextReviewState(score, next[index].state),
        updatedAt,
      };
      return;
    }

    next.push({
      id: createId("review"),
      userId,
      expression: item.expression,
      meaningKo: item.meaningKo,
      lessonId: item.lessonId,
      state: nextReviewState(score, "new"),
      lastScore: score,
      updatedAt,
    });
  });

  return next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
