"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/auth/app-provider";
import { getDifficultyLabel } from "@/lib/utils/labels";
import type { Difficulty, StudySentence, VocabularyWord } from "@/lib/types";

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

type CollectionFilter = "all" | "today" | "favorite" | "mastered";

export function VocabularyScreen() {
  const {
    vocabularyWords,
    studySentences,
    studyPreferences,
    toggleWordFavorite,
    toggleWordMastered,
    toggleWordToday,
    toggleSentenceFavorite,
    toggleSentenceMastered,
    toggleSentenceToday,
  } = useApp();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("words");
  const [difficulty, setDifficulty] = useState<"all" | Difficulty>("all");
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>("all");
  const [query, setQuery] = useState("");
  const [sentenceCardIndex, setSentenceCardIndex] = useState(0);
  const [showSentenceMeaning, setShowSentenceMeaning] = useState(true);

  const normalizedQuery = query.trim().toLowerCase();
  const actionableTodayWordCount = studyPreferences.todayWordIds.filter(
    (id) => !studyPreferences.masteredWordIds.includes(id),
  ).length;
  const actionableTodaySentenceCount = studyPreferences.todaySentenceIds.filter(
    (id) => !studyPreferences.masteredSentenceIds.includes(id),
  ).length;
  const currentFavoriteCount =
    tab === "words" ? studyPreferences.favoriteWordIds.length : studyPreferences.favoriteSentenceIds.length;
  const currentMasteredCount =
    tab === "words" ? studyPreferences.masteredWordIds.length : studyPreferences.masteredSentenceIds.length;
  const currentTotalCount = tab === "words" ? vocabularyWords.length : studySentences.length;

  const visibleWords = useMemo(
    () =>
      vocabularyWords.filter((item) => {
        const matchesDifficulty = difficulty === "all" || item.difficulty === difficulty;
        const haystack = `${item.japanese} ${item.reading} ${item.meaningKo} ${item.category}`.toLowerCase();
        const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
        const isFavorite = studyPreferences.favoriteWordIds.includes(item.id);
        const isMastered = studyPreferences.masteredWordIds.includes(item.id);
        const isToday = studyPreferences.todayWordIds.includes(item.id);
        const matchesCollection =
          collectionFilter === "all" ||
          (collectionFilter === "today" && isToday) ||
          (collectionFilter === "favorite" && isFavorite) ||
          (collectionFilter === "mastered" && isMastered);
        const visibleByMasteredState = collectionFilter === "mastered" ? isMastered : !isMastered;

        return matchesDifficulty && matchesQuery && matchesCollection && visibleByMasteredState;
      }),
    [collectionFilter, difficulty, normalizedQuery, studyPreferences.favoriteWordIds, studyPreferences.masteredWordIds, studyPreferences.todayWordIds, vocabularyWords],
  );

  const visibleSentences = useMemo(
    () =>
      studySentences.filter((item) => {
        const matchesDifficulty = difficulty === "all" || item.difficulty === difficulty;
        const haystack = `${item.japanese} ${item.reading} ${item.meaningKo} ${item.category} ${item.patternKo}`.toLowerCase();
        const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
        const isFavorite = studyPreferences.favoriteSentenceIds.includes(item.id);
        const isMastered = studyPreferences.masteredSentenceIds.includes(item.id);
        const isToday = studyPreferences.todaySentenceIds.includes(item.id);
        const matchesCollection =
          collectionFilter === "all" ||
          (collectionFilter === "today" && isToday) ||
          (collectionFilter === "favorite" && isFavorite) ||
          (collectionFilter === "mastered" && isMastered);
        const visibleByMasteredState = collectionFilter === "mastered" ? isMastered : !isMastered;

        return matchesDifficulty && matchesQuery && matchesCollection && visibleByMasteredState;
      }),
    [collectionFilter, difficulty, normalizedQuery, studyPreferences.favoriteSentenceIds, studyPreferences.masteredSentenceIds, studyPreferences.todaySentenceIds, studySentences],
  );

  const sentenceCardItems = useMemo(() => {
    const todayItems = studySentences.filter((item) => studyPreferences.todaySentenceIds.includes(item.id));
    return todayItems.length > 0 ? todayItems : visibleSentences.slice(0, 8);
  }, [studyPreferences.todaySentenceIds, studySentences, visibleSentences]);

  useEffect(() => {
    if (sentenceCardItems.length === 0) {
      setSentenceCardIndex(0);
      return;
    }

    setSentenceCardIndex((current) => (current >= sentenceCardItems.length ? 0 : current));
  }, [sentenceCardItems.length]);

  const activeSentenceCard = sentenceCardItems[sentenceCardIndex] ?? null;
  const visibleCount = tab === "words" ? visibleWords.length : visibleSentences.length;

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-orange-300">N5 학습 아카이브</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">오늘 외울 것만 모아 볼 수 있어요</h1>
        <p className="mt-2 text-sm text-stone-300">
          단어와 문장을 분리하고, 즐겨찾기와 암기 완료 체크, 오늘 외울 목록, 음독 미니 카드까지 한 화면에 담았습니다.
        </p>
      </div>

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-5">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="전체"
              value={`${currentTotalCount}개`}
              active={collectionFilter === "all"}
              onClick={() => {
                setCollectionFilter("all");
              }}
            />
            <StatCard
              label={tab === "words" ? "오늘 외울 단어" : "오늘 외울 문장"}
              value={`${tab === "words" ? actionableTodayWordCount : actionableTodaySentenceCount}개`}
              active={collectionFilter === "today"}
              onClick={() => {
                setCollectionFilter("today");
              }}
            />
            <StatCard
              label="즐겨찾기"
              value={`${currentFavoriteCount}개`}
              active={collectionFilter === "favorite"}
              onClick={() => setCollectionFilter("favorite")}
            />
            <StatCard
              label="암기 완료"
              value={`${currentMasteredCount}개`}
              active={collectionFilter === "mastered"}
              onClick={() => setCollectionFilter("mastered")}
            />
          </div>

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
                  className={`rounded-full px-4 py-2 text-sm ${difficulty === item.id ? "bg-stone-100 font-semibold text-stone-950" : "border border-white/10 bg-white/5 text-stone-200"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="현재 보기" value={`${visibleCount}개`} />
            <StatCard label="선택 탭" value={tab === "words" ? "단어" : "문장"} />
          </div>
        </div>
      </section>

      {tab === "sentences" && activeSentenceCard && (
        <section className="rounded-[30px] border border-orange-300/20 bg-[linear-gradient(135deg,rgba(255,141,93,0.2),rgba(255,209,102,0.06))] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-orange-200">예문 음독 미니 카드</p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                {sentenceCardItems.length > 0 ? `${sentenceCardIndex + 1} / ${sentenceCardItems.length}` : "0 / 0"}
              </h2>
            </div>
            <button
              onClick={() => setShowSentenceMeaning((current) => !current)}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-stone-100"
            >
              {showSentenceMeaning ? "뜻 숨기기" : "뜻 보기"}
            </button>
          </div>

          <div className="mt-4 rounded-[28px] border border-white/10 bg-stone-950/40 p-5">
            <p className="text-2xl font-semibold leading-9 text-white">{activeSentenceCard.japanese}</p>
            <p className="mt-3 text-sm text-stone-300">{activeSentenceCard.reading}</p>
            {showSentenceMeaning && (
              <>
                <p className="mt-4 text-base text-stone-100">{activeSentenceCard.meaningKo}</p>
                <p className="mt-2 text-sm text-stone-300">패턴: {activeSentenceCard.patternKo}</p>
              </>
            )}
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-400">
              <span className="rounded-full bg-black/20 px-3 py-1">{activeSentenceCard.category}</span>
              <span className="rounded-full bg-black/20 px-3 py-1">{getDifficultyLabel(activeSentenceCard.difficulty)}</span>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setSentenceCardIndex((current) => (current === 0 ? sentenceCardItems.length - 1 : current - 1))}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100"
            >
              이전 카드
            </button>
            <button
              onClick={() => setSentenceCardIndex((current) => (current + 1) % sentenceCardItems.length)}
              className="rounded-2xl bg-orange-400 px-4 py-3 text-sm font-semibold text-stone-950"
            >
              다음 카드
            </button>
          </div>
        </section>
      )}

      {tab === "words" ? (
        visibleWords.length > 0 ? (
          visibleWords.map((item) => (
            <WordCard
              key={item.id}
              item={item}
              favorite={studyPreferences.favoriteWordIds.includes(item.id)}
              mastered={studyPreferences.masteredWordIds.includes(item.id)}
              selectedForToday={studyPreferences.todayWordIds.includes(item.id)}
              onToggleFavorite={() => toggleWordFavorite(item.id)}
              onToggleMastered={() => toggleWordMastered(item.id)}
              onToggleToday={() => toggleWordToday(item.id)}
            />
          ))
        ) : (
          <EmptyPanel text="조건에 맞는 단어가 아직 없어요. 검색어나 필터를 바꿔 보세요." />
        )
      ) : visibleSentences.length > 0 ? (
        visibleSentences.map((item) => (
          <SentenceCard
            key={item.id}
            item={item}
            favorite={studyPreferences.favoriteSentenceIds.includes(item.id)}
            mastered={studyPreferences.masteredSentenceIds.includes(item.id)}
            selectedForToday={studyPreferences.todaySentenceIds.includes(item.id)}
            onToggleFavorite={() => toggleSentenceFavorite(item.id)}
            onToggleMastered={() => toggleSentenceMastered(item.id)}
            onToggleToday={() => toggleSentenceToday(item.id)}
          />
        ))
      ) : (
        <EmptyPanel text="조건에 맞는 문장이 아직 없어요. 검색어나 필터를 바꿔 보세요." />
      )}
    </div>
  );
}

function WordCard({
  item,
  favorite,
  mastered,
  selectedForToday,
  onToggleFavorite,
  onToggleMastered,
  onToggleToday,
}: {
  item: VocabularyWord;
  favorite: boolean;
  mastered: boolean;
  selectedForToday: boolean;
  onToggleFavorite: () => void;
  onToggleMastered: () => void;
  onToggleToday: () => void;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
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
        {favorite && <span className="rounded-full bg-amber-400/15 px-3 py-1 text-amber-200">즐겨찾기</span>}
        {selectedForToday && <span className="rounded-full bg-sky-400/15 px-3 py-1 text-sky-200">오늘 외울 것</span>}
        {mastered && <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-emerald-200">암기 완료</span>}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton active={selectedForToday} label={selectedForToday ? "오늘 목록 해제" : "오늘 외울 것"} onClick={onToggleToday} />
        <ActionButton active={favorite} label={favorite ? "즐겨찾기 해제" : "즐겨찾기"} onClick={onToggleFavorite} />
        <ActionButton active={mastered} label={mastered ? "암기 완료 해제" : "암기 완료"} onClick={onToggleMastered} />
      </div>
    </div>
  );
}

function SentenceCard({
  item,
  favorite,
  mastered,
  selectedForToday,
  onToggleFavorite,
  onToggleMastered,
  onToggleToday,
}: {
  item: StudySentence;
  favorite: boolean;
  mastered: boolean;
  selectedForToday: boolean;
  onToggleFavorite: () => void;
  onToggleMastered: () => void;
  onToggleToday: () => void;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
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
        {favorite && <span className="rounded-full bg-amber-400/15 px-3 py-1 text-amber-200">즐겨찾기</span>}
        {selectedForToday && <span className="rounded-full bg-sky-400/15 px-3 py-1 text-sky-200">오늘 외울 것</span>}
        {mastered && <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-emerald-200">암기 완료</span>}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton active={selectedForToday} label={selectedForToday ? "오늘 목록 해제" : "오늘 외울 것"} onClick={onToggleToday} />
        <ActionButton active={favorite} label={favorite ? "즐겨찾기 해제" : "즐겨찾기"} onClick={onToggleFavorite} />
        <ActionButton active={mastered} label={mastered ? "암기 완료 해제" : "암기 완료"} onClick={onToggleMastered} />
      </div>
    </div>
  );
}

function ActionButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-4 py-2 text-sm ${active ? "bg-orange-400 font-semibold text-stone-950" : "border border-white/10 bg-black/20 text-stone-100"}`}
    >
      {label}
    </button>
  );
}

function StatCard({
  label,
  value,
  active = false,
  onClick,
}: {
  label: string;
  value: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${active ? "border-orange-300/50 bg-orange-400/15" : "border-white/10 bg-black/20"}`}
    >
      <p className="text-xs uppercase tracking-[0.16em] text-stone-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </button>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return <div className="rounded-[28px] border border-dashed border-white/10 p-6 text-sm text-stone-400">{text}</div>;
}
