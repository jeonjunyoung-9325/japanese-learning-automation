"use client";

import { useState } from "react";
import { useApp } from "@/components/auth/app-provider";
import { getCategoryLabel, getLessonTitleLabel } from "@/lib/utils/labels";

export function VocabularyScreen() {
  const { vocabularyItems, lessons } = useApp();
  const [filter, setFilter] = useState<"all" | "weak" | "mastered">("all");

  const visibleItems = vocabularyItems.filter((item) => {
    if (filter === "weak") {
      return !item.mastered;
    }

    if (filter === "mastered") {
      return item.mastered;
    }

    return true;
  });

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-orange-300">개인 단어장</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">연습한 표현을 다시 모아보기</h1>
        <p className="mt-2 text-sm text-stone-300">연습한 레슨의 핵심 표현과 취약 표현을 한곳에서 볼 수 있습니다.</p>
      </div>

      <div className="flex gap-2">
        <FilterButton active={filter === "all"} onClick={() => setFilter("all")} label="전체" />
        <FilterButton active={filter === "weak"} onClick={() => setFilter("weak")} label="취약 표현" />
        <FilterButton active={filter === "mastered"} onClick={() => setFilter("mastered")} label="익숙한 표현" />
      </div>

      {visibleItems.length > 0 ? (
        visibleItems.map((item) => {
          const lesson = lessons.find((candidate) => candidate.id === item.lessonId);

          return (
            <div key={item.id} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-white">{item.japanese}</h2>
                  <p className="mt-1 text-sm text-stone-400">{item.reading}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${item.mastered ? "bg-emerald-400/15 text-emerald-200" : "bg-orange-400/15 text-orange-200"}`}>
                  {item.mastered ? "익숙함" : "복습 필요"}
                </span>
              </div>
              <p className="mt-3 text-base text-stone-100">{item.meaningKo}</p>
              <p className="mt-2 text-sm text-stone-300">{item.notesKo}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-400">
                <span className="rounded-full bg-black/20 px-3 py-1">{getCategoryLabel(item.category)}</span>
                <span className="rounded-full bg-black/20 px-3 py-1">{lesson ? getLessonTitleLabel(lesson) : item.lessonTitle}</span>
                <span className="rounded-full bg-black/20 px-3 py-1">{item.source === "review" ? "복습에서 저장" : "레슨에서 학습"}</span>
              </div>
            </div>
          );
        })
      ) : (
        <div className="rounded-[28px] border border-dashed border-white/10 p-6 text-sm text-stone-400">
          아직 단어장에 표시할 표현이 없어요. 레슨을 연습하면 핵심 표현이 자동으로 모입니다.
        </div>
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm ${active ? "bg-orange-400 font-semibold text-stone-950" : "border border-white/10 bg-white/5 text-stone-200"}`}
    >
      {label}
    </button>
  );
}
