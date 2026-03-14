"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/auth/app-provider";

export function AuthFlow() {
  const router = useRouter();
  const { loading, profile, isSupabaseConfigured, isGuestMode, continueAsGuest, saveOnboarding, signIn, signUp } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [level, setLevel] = useState<"complete-beginner" | "beginner" | "lower-intermediate">("complete-beginner");
  const [goal, setGoal] = useState<"travel" | "daily-conversation" | "work" | "jlpt-support">("travel");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleAuth() {
    setBusy(true);
    setError("");

    const result = mode === "login" ? await signIn(email, password) : await signUp(email, password);

    if (result.error) {
      setError(result.error);
    }

    setBusy(false);
  }

  async function handleGuest() {
    setBusy(true);
    await continueAsGuest();
    setBusy(false);
  }

  async function handleOnboarding() {
    setBusy(true);
    await saveOnboarding({
      displayName: displayName || "학습자",
      japaneseLevel: level,
      learningGoal: goal,
    });
    router.push("/dashboard");
    setBusy(false);
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-stone-300">연습 화면을 불러오는 중...</div>;
  }

  if (profile?.onboardingCompleted) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-5 py-10">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-7 shadow-2xl shadow-black/30 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-300">코토바 스피크</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">부담 없이 짧게, 일본어로 말해보세요.</h1>
          <p className="mt-3 text-sm leading-6 text-stone-300">
            한국인 학습자를 위해 만든 일본어 회화 연습 앱입니다. 짧은 상황형 연습, 구조화 피드백, 약한 표현 복습, 진도 추적을 한 번에 제공합니다.
          </p>
          <div className="mt-6 grid gap-3">
            <Link href="/dashboard" className="rounded-2xl bg-orange-400 px-4 py-3 text-center font-semibold text-stone-950">
              대시보드로 이동
            </Link>
            <Link href="/lessons" className="rounded-2xl border border-white/10 px-4 py-3 text-center text-stone-200">
              전체 레슨 보기
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (profile) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-5 py-10">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-7 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-300">온보딩</p>
          <h1 className="mt-3 text-3xl font-semibold">첫 연습 경로를 설정해 볼까요?</h1>
          <p className="mt-2 text-sm text-stone-300">1분도 걸리지 않으며, 대시보드에 맞춤형 레슨을 추천해 줍니다.</p>
          <div className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm">
              <span>이름</span>
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="rounded-2xl border border-white/10 bg-stone-900/80 px-4 py-3 outline-none" placeholder="어떻게 불러드릴까요?" />
            </label>
            <label className="grid gap-2 text-sm">
              <span>일본어 레벨</span>
              <select value={level} onChange={(event) => setLevel(event.target.value as typeof level)} className="rounded-2xl border border-white/10 bg-stone-900/80 px-4 py-3 outline-none">
                <option value="complete-beginner">완전 초급</option>
                <option value="beginner">초급</option>
                <option value="lower-intermediate">초중급</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              <span>학습 목표</span>
              <select value={goal} onChange={(event) => setGoal(event.target.value as typeof goal)} className="rounded-2xl border border-white/10 bg-stone-900/80 px-4 py-3 outline-none">
                <option value="travel">여행</option>
                <option value="daily-conversation">일상 회화</option>
                <option value="work">업무</option>
                <option value="jlpt-support">JLPT 대비</option>
              </select>
            </label>
            <button onClick={handleOnboarding} disabled={busy} className="rounded-2xl bg-orange-400 px-4 py-3 font-semibold text-stone-950 disabled:opacity-50">
              연습 시작하기
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 px-5 py-10">
      <section className="rounded-[32px] border border-white/10 bg-white/5 p-7 shadow-2xl shadow-black/30 backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-300">코토바 스피크 MVP</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-white">짧고 반복 가능한 드릴로 일본어 말하기를 늘려보세요.</h1>
        <p className="mt-3 text-sm leading-6 text-stone-300">
          모바일 중심 연습, 상황 카드, 브라우저 음성 입력 베타, 구조화 피드백, 가벼운 진도 추적을 제공합니다.
        </p>
        <div className="mt-6 grid gap-3 text-sm text-stone-200">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">카페, 쇼핑, 기차역, 호텔, 업무, 일상 대화까지 20개 이상의 실전 레슨이 들어 있습니다.</div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">음성 입력은 브라우저 음성 인식만 사용하며, 유료 음성 API는 쓰지 않습니다.</div>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-stone-950/80 p-6">
        <div className="mb-4 flex gap-2 rounded-full bg-white/5 p-1 text-sm">
          <button onClick={() => setMode("signup")} className={`flex-1 rounded-full px-4 py-2 ${mode === "signup" ? "bg-white text-stone-950" : "text-stone-300"}`}>회원가입</button>
          <button onClick={() => setMode("login")} className={`flex-1 rounded-full px-4 py-2 ${mode === "login" ? "bg-white text-stone-950" : "text-stone-300"}`}>로그인</button>
        </div>

        <div className="grid gap-3">
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="이메일" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none" />
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="비밀번호" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none" />
          <button onClick={handleAuth} disabled={busy || !isSupabaseConfigured} className="rounded-2xl bg-orange-400 px-4 py-3 font-semibold text-stone-950 disabled:opacity-50">
            {mode === "signup" ? "계정 만들기" : "로그인"}
          </button>
          <button onClick={handleGuest} disabled={busy} className="rounded-2xl border border-white/10 px-4 py-3 text-stone-100">
            게스트 모드로 시작
          </button>
        </div>

        {!isSupabaseConfigured && (
          <p className="mt-3 text-sm text-stone-400">
            아직 Supabase 인증이 연결되지 않아 이메일 로그인은 비활성화되어 있어요. 그래도 게스트 모드로 전체 MVP를 체험할 수 있습니다.
          </p>
        )}
        {isGuestMode && <p className="mt-3 text-sm text-emerald-300">이 브라우저에서 게스트 모드를 사용할 수 있어요.</p>}
        {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
      </section>
    </main>
  );
}
