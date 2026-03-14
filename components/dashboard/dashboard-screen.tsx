"use client";

import Link from "next/link";
import { useApp } from "@/components/auth/app-provider";
import {
  getLearningGoalLabel,
  getLessonTitleLabel,
  getReviewStateLabel,
} from "@/lib/utils/labels";
import { calculateAverageScore } from "@/lib/utils/scoring";

export function DashboardScreen() {
  const { lessons, attempts, reviewItems, streak, dailyProgress, profile } = useApp();

  const recommendedLesson = lessons[0];
  const averageScore = calculateAverageScore(attempts);
  const completedLessons = new Set(attempts.map((attempt) => attempt.lessonId)).size;
  const recentWeakExpressions = reviewItems.slice(0, 4);

  return (
    <div className="grid gap-4">
      <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,141,93,0.25),rgba(255,209,102,0.08))] p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-orange-200">오늘의 추천 레슨</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">{getLessonTitleLabel(recommendedLesson)}</h1>
        <p className="mt-2 text-sm leading-6 text-orange-50/80">{recommendedLesson.explanationKo}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={`/lessons/${recommendedLesson.id}`} className="rounded-2xl bg-white px-4 py-3 font-semibold text-stone-950">
            레슨 시작
          </Link>
          <Link href="/review" className="rounded-2xl border border-white/20 px-4 py-3 text-sm text-white">
            빠른 복습
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <MetricCard label="연속 학습" value={`${streak?.currentStreak ?? 0}일`} helper={`최고 ${streak?.bestStreak ?? 0}일`} />
        <MetricCard label="완료한 레슨" value={`${completedLessons}`} helper={`총 ${attempts.length}회 답변`} />
        <MetricCard label="평균 점수" value={`${averageScore}점`} helper="전체 시도 기준" />
        <MetricCard label="오늘 연습" value={`${dailyProgress.at(-1)?.attemptsCount ?? 0}회`} helper={getLearningGoalLabel(profile?.learningGoal)} />
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">최근에 약했던 표현</h2>
            <p className="mt-1 text-sm text-stone-300">아쉬웠던 답변은 자동으로 저장해서 나중에 빠르게 복습할 수 있어요.</p>
          </div>
          <Link href="/review" className="text-sm text-orange-300">복습 열기</Link>
        </div>
        <div className="mt-4 grid gap-3">
          {recentWeakExpressions.length > 0 ? (
            recentWeakExpressions.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-stone-900/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <strong className="text-white">{item.expression}</strong>
                  <span className="rounded-full bg-orange-400/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-orange-200">{getReviewStateLabel(item.state)}</span>
                </div>
                <p className="mt-2 text-sm text-stone-300">{item.meaningKo}</p>
              </div>
            ))
          ) : (
            <EmptyPanel text="아직 복습할 표현이 없어요. 레슨을 진행하면 약한 표현이 자동으로 쌓입니다." />
          )}
        </div>
      </section>
    </div>
  );
}

function MetricCard(props: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-stone-400">{props.label}</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{props.value}</h2>
      <p className="mt-2 text-xs text-stone-500">{props.helper}</p>
    </div>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-stone-400">{text}</div>;
}
