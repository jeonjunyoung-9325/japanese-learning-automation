"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { demoLessons } from "@/lib/demo/lessons";
import type {
  DailyProgress,
  InputMode,
  Lesson,
  LessonPrompt,
  PracticeAttempt,
  PracticeFeedback,
  ReviewItem,
  Streak,
  UserProfile,
  VocabularyItem,
} from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { getTodayKey } from "@/lib/utils/date";
import { createId } from "@/lib/utils/ids";
import { calculateAverageScore, calculateStreak, updateReviewItems, upsertDailyProgress } from "@/lib/utils/scoring";

const LOCAL_STORAGE_KEY = "kotoba-speak-state";
const LOCAL_GUEST_KEY = "kotoba-speak-guest";

type AppContextValue = {
  loading: boolean;
  session: Session | null;
  isSupabaseConfigured: boolean;
  isGuestMode: boolean;
  profile: UserProfile | null;
  lessons: Lesson[];
  attempts: PracticeAttempt[];
  reviewItems: ReviewItem[];
  dailyProgress: DailyProgress[];
  streak: Streak | null;
  vocabularyItems: VocabularyItem[];
  signIn: (email: string, password: string) => Promise<{ error?: string; message?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string; message?: string }>;
  continueAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  saveOnboarding: (payload: {
    displayName: string;
    japaneseLevel: UserProfile["japaneseLevel"];
    learningGoal: UserProfile["learningGoal"];
  }) => Promise<void>;
  submitAttempt: (payload: {
    lesson: Lesson;
    prompt: LessonPrompt;
    answer: string;
    inputMode: InputMode;
  }) => Promise<PracticeFeedback>;
};

const AppContext = createContext<AppContextValue | null>(null);

function createGuestProfile(): UserProfile {
  const now = new Date().toISOString();

  return {
    id: "guest-user",
    displayName: "체험 학습자",
    email: null,
    onboardingCompleted: false,
    createdAt: now,
    updatedAt: now,
  };
}

function createEmptyStreak(userId: string): Streak {
  return {
    id: createId("streak"),
    userId,
    currentStreak: 0,
    bestStreak: 0,
    lastPracticeDate: null,
  };
}

type LocalState = {
  profile: UserProfile;
  attempts: PracticeAttempt[];
  reviewItems: ReviewItem[];
  dailyProgress: DailyProgress[];
  streak: Streak;
};

function readLocalState(): LocalState {
  const raw = typeof window === "undefined" ? null : window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) {
    const profile = createGuestProfile();
    return {
      profile,
      attempts: [],
      reviewItems: [],
      dailyProgress: [],
      streak: createEmptyStreak(profile.id),
    };
  }

  return JSON.parse(raw) as LocalState;
}

function writeLocalState(state: LocalState) {
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);

  const supabaseConfig = getSupabaseConfig();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const init = async () => {
      const guestFlag = window.localStorage.getItem(LOCAL_GUEST_KEY) === "true";
      setIsGuestMode(guestFlag);

      if (guestFlag || !supabase) {
        const local = readLocalState();
        setProfile(local.profile);
        setAttempts(local.attempts);
        setReviewItems(local.reviewItems);
        setDailyProgress(local.dailyProgress);
        setStreak(local.streak);
        setLoading(false);
        return;
      }

      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();

      setSession(initialSession);

      if (initialSession?.user) {
        await hydrateFromSupabase(initialSession.user.id);
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession);
        if (nextSession?.user) {
          void hydrateFromSupabase(nextSession.user.id);
        } else {
          setProfile(null);
          setAttempts([]);
          setReviewItems([]);
          setDailyProgress([]);
          setStreak(null);
        }
        setLoading(false);
      });

      setLoading(false);

      return () => subscription.unsubscribe();
    };

    const maybeCleanup = init();

    return () => {
      void maybeCleanup;
    };
  }, [supabase]);

  async function hydrateFromSupabase(userId: string) {
    if (!supabase) {
      return;
    }

    const [{ data: profileRow }, { data: attemptsRows }, { data: reviewRows }, { data: progressRows }, { data: streakRow }] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("practice_attempts").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("review_items").select("*").eq("user_id", userId).order("updated_at", { ascending: false }),
        supabase.from("daily_progress").select("*").eq("user_id", userId).order("date", { ascending: true }),
        supabase.from("streaks").select("*").eq("user_id", userId).maybeSingle(),
      ]);

    const now = new Date().toISOString();
    const resolvedProfile =
      profileRow
        ? {
            id: profileRow.id,
            email: profileRow.email,
            displayName: profileRow.display_name ?? "학습자",
            japaneseLevel: profileRow.japanese_level,
            learningGoal: profileRow.learning_goal,
            onboardingCompleted: profileRow.onboarding_completed ?? false,
            createdAt: profileRow.created_at ?? now,
            updatedAt: profileRow.updated_at ?? now,
          }
        : {
            id: userId,
            email: session?.user.email ?? null,
            displayName: session?.user.email?.split("@")[0] ?? "학습자",
            onboardingCompleted: false,
            createdAt: now,
            updatedAt: now,
          };

    setProfile(resolvedProfile);

    if (!profileRow) {
      await supabase.from("profiles").upsert({
        id: resolvedProfile.id,
        email: resolvedProfile.email,
        display_name: resolvedProfile.displayName,
        onboarding_completed: resolvedProfile.onboardingCompleted,
        created_at: resolvedProfile.createdAt,
        updated_at: resolvedProfile.updatedAt,
      });
    }

    setAttempts((attemptsRows ?? []).map((row) => ({
      id: row.id,
      lessonId: row.lesson_id,
      promptId: row.prompt_id,
      userId: row.user_id,
      answer: row.answer,
      inputMode: row.input_mode,
      feedback: row.feedback,
      createdAt: row.created_at,
    })));
    setReviewItems((reviewRows ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      expression: row.expression,
      meaningKo: row.meaning_ko,
      lessonId: row.lesson_id,
      promptId: row.prompt_id ?? "p1",
      state: row.state,
      lastScore: row.last_score,
      updatedAt: row.updated_at,
    })));
    setDailyProgress((progressRows ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      date: row.date,
      attemptsCount: row.attempts_count,
      completedLessons: row.completed_lessons,
      averageScore: row.average_score,
    })));
    setStreak(
      streakRow
        ? {
            id: streakRow.id,
            userId: streakRow.user_id,
            currentStreak: streakRow.current_streak,
            bestStreak: streakRow.best_streak,
            lastPracticeDate: streakRow.last_practice_date,
          }
        : createEmptyStreak(userId),
    );
  }

  async function signIn(email: string, password: string) {
    if (!supabase) {
      return { error: "아직 Supabase가 설정되지 않았어요. 게스트 모드를 사용하거나 환경 변수를 먼저 추가해 주세요." };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : { message: "로그인 중입니다..." };
  }

  async function signUp(email: string, password: string) {
    if (!supabase) {
      return { error: "아직 Supabase가 설정되지 않았어요. 게스트 모드를 사용하거나 환경 변수를 먼저 추가해 주세요." };
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return { error: error.message };
    }

    if (data.session) {
      return { message: "회원가입이 완료되었습니다. 바로 시작해 보세요." };
    }

    return { message: "회원가입이 완료되었습니다. 이메일 받은편지함에서 인증 후 로그인해 주세요." };
  }

  async function continueAsGuest() {
    const local = readLocalState();
    window.localStorage.setItem(LOCAL_GUEST_KEY, "true");
    setIsGuestMode(true);
    setProfile(local.profile);
    setAttempts(local.attempts);
    setReviewItems(local.reviewItems);
    setDailyProgress(local.dailyProgress);
    setStreak(local.streak);
  }

  async function signOut() {
    if (supabase && session) {
      await supabase.auth.signOut();
    }

    window.localStorage.removeItem(LOCAL_GUEST_KEY);
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    setIsGuestMode(false);
    setSession(null);
    setProfile(null);
    setAttempts([]);
    setReviewItems([]);
    setDailyProgress([]);
    setStreak(null);
  }

  async function saveOnboarding(payload: {
    displayName: string;
    japaneseLevel: UserProfile["japaneseLevel"];
    learningGoal: UserProfile["learningGoal"];
  }) {
    if (!profile) {
      return;
    }

    const nextProfile: UserProfile = {
      ...profile,
      displayName: payload.displayName,
      japaneseLevel: payload.japaneseLevel,
      learningGoal: payload.learningGoal,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    };

    setProfile(nextProfile);

    if (isGuestMode || !supabase || !session?.user) {
      const current = readLocalState();
      writeLocalState({ ...current, profile: nextProfile });
      return;
    }

    await supabase.from("profiles").upsert({
      id: session.user.id,
      email: session.user.email,
      display_name: nextProfile.displayName,
      japanese_level: nextProfile.japaneseLevel,
      learning_goal: nextProfile.learningGoal,
      onboarding_completed: true,
      updated_at: nextProfile.updatedAt,
    });
  }

  async function submitAttempt(payload: {
    lesson: Lesson;
    prompt: LessonPrompt;
    answer: string;
    inputMode: InputMode;
  }) {
    if (!profile) {
      throw new Error("활성 학습자 정보가 없습니다.");
    }

    const createdAt = new Date().toISOString();
    const expressions = payload.lesson.expressions.filter((expression) =>
      payload.prompt.keyExpressionIds.includes(expression.id),
    );
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answer: payload.answer,
        targetAnswer: payload.prompt.targetAnswer,
        instructionKo: payload.prompt.instructionKo,
        expressions,
      }),
    });

    if (!response.ok) {
      throw new Error(`피드백 생성 중 오류가 발생했습니다. (${response.status})`);
    }

    const feedback = (await response.json()) as PracticeFeedback;
    const attempt: PracticeAttempt = {
      id: createId("attempt"),
      lessonId: payload.lesson.id,
      promptId: payload.prompt.id,
      userId: profile.id,
      answer: payload.answer,
      inputMode: payload.inputMode,
      feedback,
      createdAt,
    };

    const nextAttempts = [attempt, ...attempts];
    const reviewSeed = payload.lesson.expressions
      .filter((expression) => feedback.weakExpressions.includes(expression.japanese))
      .map((expression) => ({
        expression: expression.japanese,
        meaningKo: expression.meaningKo,
        lessonId: payload.lesson.id,
        promptId: payload.prompt.id,
      }));
    const nextReviewItems = updateReviewItems(
      reviewItems,
      reviewSeed,
      profile.id,
      feedback.overallScore,
      createdAt,
    );
    const nextDailyProgress = upsertDailyProgress(
      dailyProgress,
      nextAttempts,
      profile.id,
      getTodayKey(new Date(createdAt)),
    );
    const nextStreak = calculateStreak(nextDailyProgress, profile.id);

    setAttempts(nextAttempts);
    setReviewItems(nextReviewItems);
    setDailyProgress(nextDailyProgress);
    setStreak(nextStreak);

    if (isGuestMode || !supabase || !session?.user) {
      writeLocalState({
        profile,
        attempts: nextAttempts,
        reviewItems: nextReviewItems,
        dailyProgress: nextDailyProgress,
        streak: nextStreak,
      });

      return feedback;
    }

    await Promise.all([
      supabase.from("practice_attempts").insert({
        id: attempt.id,
        user_id: session.user.id,
        lesson_id: attempt.lessonId,
        prompt_id: attempt.promptId,
        answer: attempt.answer,
        input_mode: attempt.inputMode,
        feedback: attempt.feedback,
        created_at: attempt.createdAt,
      }),
      Promise.all(
        nextReviewItems.map((item) =>
          supabase.from("review_items").upsert({
            id: item.id,
            user_id: session.user.id,
            expression: item.expression,
            meaning_ko: item.meaningKo,
            lesson_id: item.lessonId,
            prompt_id: item.promptId,
            state: item.state,
            last_score: item.lastScore,
            updated_at: item.updatedAt,
          }),
        ),
      ),
      Promise.all(
        nextDailyProgress.map((item) =>
          supabase.from("daily_progress").upsert({
            id: item.id,
            user_id: session.user.id,
            date: item.date,
            attempts_count: item.attemptsCount,
            completed_lessons: item.completedLessons,
            average_score: item.averageScore,
          }),
        ),
      ),
      supabase.from("streaks").upsert({
        id: nextStreak.id,
        user_id: session.user.id,
        current_streak: nextStreak.currentStreak,
        best_streak: nextStreak.bestStreak,
        last_practice_date: nextStreak.lastPracticeDate,
      }),
    ]);

    return feedback;
  }

  const value = useMemo<AppContextValue>(
    () => ({
      loading,
      session,
      isSupabaseConfigured: supabaseConfig.isConfigured,
      isGuestMode,
      profile,
      lessons: demoLessons,
      attempts,
      reviewItems,
      dailyProgress,
      streak,
      vocabularyItems: buildVocabularyItems(demoLessons, attempts, reviewItems),
      signIn,
      signUp,
      continueAsGuest,
      signOut,
      saveOnboarding,
      submitAttempt,
    }),
    [loading, session, supabaseConfig.isConfigured, isGuestMode, profile, attempts, reviewItems, dailyProgress, streak],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function buildVocabularyItems(
  lessons: Lesson[],
  attempts: PracticeAttempt[],
  reviewItems: ReviewItem[],
): VocabularyItem[] {
  const attemptedLessonIds = new Set(attempts.map((attempt) => attempt.lessonId));
  const reviewExpressionSet = new Set(reviewItems.map((item) => item.expression));

  return lessons
    .filter((lesson) => attemptedLessonIds.has(lesson.id) || reviewItems.some((item) => item.lessonId === lesson.id))
    .flatMap((lesson) =>
      lesson.expressions.map<VocabularyItem>((expression) => ({
        id: `${lesson.id}-${expression.id}`,
        lessonId: lesson.id,
        expressionId: expression.id,
        japanese: expression.japanese,
        reading: expression.reading,
        meaningKo: expression.meaningKo,
        notesKo: expression.notesKo,
        category: lesson.category,
        lessonTitle: lesson.title,
        mastered: !reviewExpressionSet.has(expression.japanese),
        source: reviewExpressionSet.has(expression.japanese) ? "review" : "lesson",
      })),
    )
    .sort((left, right) => Number(left.mastered) - Number(right.mastered) || left.lessonId.localeCompare(right.lessonId));
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }

  return context;
}
