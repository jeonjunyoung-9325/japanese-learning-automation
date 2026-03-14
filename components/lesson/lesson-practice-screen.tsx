"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/auth/app-provider";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { getCategoryLabel, getLessonTitleLabel } from "@/lib/utils/labels";

export function LessonPracticeScreen({ lessonId }: { lessonId: string }) {
  const { lessons, submitAttempt } = useApp();
  const lesson = lessons.find((item) => item.id === lessonId);
  const [promptIndex, setPromptIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Awaited<ReturnType<typeof submitAttempt>> | null>(null);

  const prompt = lesson?.prompts[promptIndex];
  const progress = lesson ? ((promptIndex + (feedback ? 1 : 0)) / lesson.prompts.length) * 100 : 0;
  const { listening, start, stop, reset, supported } = useVoiceInput((transcript) => {
    setAnswer(transcript);
  });

  const keyExpressions = useMemo(
    () =>
      lesson?.expressions.filter((expression) => prompt?.keyExpressionIds.includes(expression.id)) ?? [],
    [lesson, prompt],
  );

  if (!lesson || !prompt) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-semibold text-white">레슨을 찾을 수 없어요</h1>
        <Link href="/lessons" className="mt-4 inline-flex rounded-2xl bg-orange-400 px-4 py-3 font-semibold text-stone-950">레슨 목록으로</Link>
      </div>
    );
  }

  const currentLesson = lesson;
  const currentPrompt = prompt;

  useEffect(() => {
    reset();
    setAnswer("");
  }, [promptIndex, reset]);

  async function handleSubmit(inputMode: "text" | "voice") {
    if (!answer.trim()) {
      return;
    }

    if (listening) {
      stop();
    }

    setBusy(true);
    const nextFeedback = await submitAttempt({
      lesson: currentLesson,
      prompt: currentPrompt,
      answer,
      inputMode,
    });
    setFeedback(nextFeedback);
    setBusy(false);
  }

  function handleNext() {
    reset();
    setFeedback(null);
    setAnswer("");
    setPromptIndex((index) => Math.min(index + 1, currentLesson.prompts.length - 1));
  }

  const isLastPrompt = promptIndex === currentLesson.prompts.length - 1;

  return (
    <div className="grid gap-4">
      <Link href="/lessons" className="text-sm text-stone-400">레슨 목록으로 돌아가기</Link>
      <section className="rounded-[30px] border border-white/10 bg-white/5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-orange-300">{getCategoryLabel(currentLesson.category)}</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{getLessonTitleLabel(currentLesson)}</h1>
            <p className="mt-2 text-sm text-stone-300">{currentLesson.explanationKo}</p>
          </div>
          <div className="rounded-2xl bg-white/5 px-3 py-2 text-sm text-stone-300">{currentLesson.estimatedMinutes}분</div>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-orange-400 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-stone-900/80 p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-stone-500">프롬프트 {promptIndex + 1}</p>
        <h2 className="mt-2 text-xl font-semibold text-white">{prompt.situation}</h2>
        <p className="mt-2 text-sm leading-6 text-stone-300">{prompt.instructionKo}</p>

        <div className="mt-4 grid gap-2">
          {keyExpressions.map((expression) => (
            <div key={expression.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="font-medium text-white">{expression.japanese}</div>
              <div className="text-sm text-stone-400">{expression.reading}</div>
              <div className="mt-1 text-sm text-stone-300">{expression.meaningKo}</div>
            </div>
          ))}
        </div>

        <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="여기에 일본어 답변을 입력해 보세요" className="mt-5 min-h-32 w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-base outline-none" />
        <div className="mt-3 flex gap-3">
          {supported ? (
            <button onClick={listening ? stop : start} className={`rounded-2xl px-4 py-3 text-sm font-medium ${listening ? "bg-rose-400 text-stone-950" : "border border-white/10 bg-white/5 text-stone-100"}`}>
              {listening ? "마이크 중지" : "음성 입력 베타"}
            </button>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-3 text-sm text-stone-400">음성 입력은 지원되는 Chrome 또는 Edge 브라우저에서만 사용할 수 있어요.</div>
          )}
          <button onClick={() => handleSubmit(supported && listening ? "voice" : "text")} disabled={busy || !answer.trim()} className="flex-1 rounded-2xl bg-orange-400 px-4 py-3 font-semibold text-stone-950 disabled:opacity-50">
            답변 제출
          </button>
        </div>
      </section>

      {feedback && (
        <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">구조화 피드백</h2>
            <div className="rounded-full bg-orange-400 px-4 py-2 text-sm font-semibold text-stone-950">{feedback.overallScore} / 100</div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <ScorePill label="자연스러움" value={feedback.scores.naturalness} />
            <ScorePill label="문법" value={feedback.scores.grammar} />
            <ScorePill label="어휘" value={feedback.scores.vocabulary} />
          </div>
          <div className="mt-5 grid gap-3 text-sm">
            <FeedbackRow title="수정 문장" text={feedback.correctedSentence} />
            <FeedbackRow title="더 자연스러운 표현" text={feedback.naturalAlternative} />
            <FeedbackRow title="한국어 설명" text={feedback.explanationKo} />
            <FeedbackRow title="격려 한마디" text={feedback.encouragement} />
          </div>
          <div className="mt-5 flex gap-3">
            {!isLastPrompt ? (
              <button onClick={handleNext} className="flex-1 rounded-2xl bg-white px-4 py-3 font-semibold text-stone-950">
                다음 프롬프트
              </button>
            ) : (
              <Link href="/dashboard" className="flex-1 rounded-2xl bg-white px-4 py-3 text-center font-semibold text-stone-950">
                레슨 마치기
              </Link>
            )}
            <button onClick={() => setFeedback(null)} className="rounded-2xl border border-white/10 px-4 py-3 text-stone-200">
              다시 해보기
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs uppercase tracking-[0.18em] text-stone-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function FeedbackRow({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-stone-950/50 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-stone-500">{title}</div>
      <div className="mt-2 leading-6 text-stone-100">{text}</div>
    </div>
  );
}
