"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/auth/app-provider";
import { getDifficultyLabel } from "@/lib/utils/labels";
import type { Difficulty } from "@/lib/types";

const tabs = [
  { id: "words", label: "단어" },
  { id: "sentences", label: "문장" },
] as const;

const difficulties: Array<{ id: "all" | Difficulty; label: string }> = [
  { id: "all", label: "전체" },
  { id: "complete-beginner", label: "완전 초급" },
  { id: "beginner", label: "초급" },
  { id: "lower-intermediate", label: "초중급" },
];

export function VocabularyScreen() {
  const { vocabularyWords, studySentences } = useApp();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("words");
  const [difficulty, setDifficulty] = useState<"all" | Difficulty>("all");
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();

  const visibleWords = useMemo(
    () =>
      vocabularyWords.filter((item) => {
        const matchesDifficulty = difficulty === "all" || item.difficulty === difficulty;
        const haystack = `${item.japanese} ${item.reading} ${item.meaningKo} ${item.category}`.toLowerCase();
        const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
        return matchesDifficulty && matchesQuery;
      }),
    [difficulty, normalizedQuery, vocabularyWords],
  );

  const visibleSentences = useMemo(
    () =>
      studySentences.filter((item) => {
        const matchesDifficulty = difficulty === "all" || item.difficulty === difficulty;
        const haystack = `${item.japanese} ${item.reading} ${item.meaningKo} ${item.category} ${item.patternKo}`.toLowerCase();
        const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
        return matchesDifficulty && matchesQuery;
      }),
    [difficulty, normalizedQuery, studySentences],
  );

  const visibleCount = tab === "words" ? visibleWords.length : visibleSentences.length;

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-orange-300">N5 학습 아카이브</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">단어와 문장을 나눠서 익혀요</h1>
        <p className="mt-2 text-sm text-stone-300">
          단어는 단어만 따로, 문장은 난이도별 패턴으로 따로 볼 수 있게 정리했습니다.
        </p>
      </div>

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-5">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-2 rounded-[24px] bg-black/20 p-1">
            {tabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`rounded-[20px] px-4 py-3 text-sm ${tab === item.id ? "bg-orange-400 font-semibold text-stone-950" : "text-stone-300"}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid gap-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={tab === "words" ? "단어, 읽는 법, 뜻으로 검색" : "문장, 뜻, 패턴으로 검색"}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none placeholder:text-stone-500"
            />
            <div className="flex flex-wrap gap-2">
              {difficulties.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setDifficulty(item.id)}
                  className={`rounded-full px-4 py-2 text-sm ${difficulty === item.id ? "bg-orange-400 font-semibold text-stone-950" : "border border-white/10 bg-white/5 text-stone-200"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatCard label="단어 수" value={`${vocabularyWords.length}개`} />
            <StatCard label="문장 수" value={`${studySentences.length}개`} />
            <StatCard label="현재 보기" value={`${visibleCount}개`} />
          </div>
        </div>
      </section>

      {tab === "words" ? (
        visibleWords.length > 0 ? (
          visibleWords.map((item) => (
            <div key={item.id} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-white">{item.japanese}</h2>
                  <p className="mt-1 text-sm text-stone-400">{item.reading}</p>
                </div>
                <span className="rounded-full bg-orange-400/15 px-3 py-1 text-xs font-medium text-orange-200">
                  {getDifficultyLabel(item.difficulty)}
                </span>
              </div>
              <p className="mt-3 text-base text-stone-100">{item.meaningKo}</p>
              <p className="mt-2 text-sm text-stone-300">{item.noteKo}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-400">
                <span className="rounded-full bg-black/20 px-3 py-1">{item.category}</span>
                <span className="rounded-full bg-black/20 px-3 py-1">{item.jlptLevel}</span>
              </div>
            </div>
          ))
        ) : (
          <EmptyPanel text="조건에 맞는 단어가 아직 없어요. 검색어나 난이도를 바꿔 보세요." />
        )
      ) : visibleSentences.length > 0 ? (
        visibleSentences.map((item) => (
          <div key={item.id} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-white">{item.japanese}</h2>
                <p className="mt-1 text-sm text-stone-400">{item.reading}</p>
              </div>
              <span className="rounded-full bg-orange-400/15 px-3 py-1 text-xs font-medium text-orange-200">
                {getDifficultyLabel(item.difficulty)}
              </span>
            </div>
            <p className="mt-3 text-base text-stone-100">{item.meaningKo}</p>
            <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-stone-500">패턴 포인트</p>
              <p className="mt-2 text-sm text-stone-200">{item.patternKo}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-400">
              <span className="rounded-full bg-black/20 px-3 py-1">{item.category}</span>
              <span className="rounded-full bg-black/20 px-3 py-1">{item.jlptLevel}</span>
            </div>
          </div>
        ))
      ) : (
        <EmptyPanel text="조건에 맞는 문장이 아직 없어요. 검색어나 난이도를 바꿔 보세요." />
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-stone-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return <div className="rounded-[28px] border border-dashed border-white/10 p-6 text-sm text-stone-400">{text}</div>;
}
