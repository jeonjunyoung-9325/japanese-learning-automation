"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useApp } from "@/components/auth/app-provider";
import { getCategoryLabel, getDifficultyLabel, getLessonGoalLabel, getLessonTitleLabel } from "@/lib/utils/labels";

export function LessonListScreen() {
  const { lessons, attempts } = useApp();
  const [category, setCategory] = useState("all");
  const categories = useMemo(() => ["all", ...new Set(lessons.map((lesson) => lesson.category))], [lessons]);

  const filteredLessons = lessons.filter((lesson) => category === "all" || lesson.category === category);
  const completedIds = new Set(attempts.map((attempt) => attempt.lessonId));

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-orange-300">상황별 드릴</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">짧은 회화 레슨을 골라보세요</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((item) => (
          <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-4 py-2 text-sm ${category === item ? "bg-orange-400 text-stone-950" : "border border-white/10 bg-white/5 text-stone-200"}`}>
            {getCategoryLabel(item)}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {filteredLessons.map((lesson) => (
          <Link key={lesson.id} href={`/lessons/${lesson.id}`} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-stone-400">{getCategoryLabel(lesson.category)}</p>
                <h2 className="mt-2 text-xl font-semibold text-white">{getLessonTitleLabel(lesson)}</h2>
              </div>
              {completedIds.has(lesson.id) && <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-200">완료</span>}
            </div>
            <p className="mt-3 text-sm text-stone-300">{getLessonGoalLabel(lesson)}</p>
            <div className="mt-4 flex items-center justify-between text-sm text-stone-400">
              <span>{getDifficultyLabel(lesson.difficulty)}</span>
              <span>{lesson.estimatedMinutes}분</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
