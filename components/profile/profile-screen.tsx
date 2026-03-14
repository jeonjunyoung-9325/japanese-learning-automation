"use client";

import { useApp } from "@/components/auth/app-provider";
import { getLearningGoalLabel } from "@/lib/utils/labels";

export function ProfileScreen() {
  const { profile, signOut, isGuestMode, isSupabaseConfigured } = useApp();

  if (!profile) {
    return null;
  }

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-orange-300">프로필</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{profile.displayName}</h1>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
        <div className="grid gap-3 text-sm text-stone-300">
          <Row label="모드" value={isGuestMode ? "게스트 체험 모드" : "Supabase 로그인"} />
          <Row label="이메일" value={profile.email ?? "게스트 전용"} />
          <Row label="레벨" value={profile.japaneseLevel === "complete-beginner" ? "완전 초급" : profile.japaneseLevel === "beginner" ? "초급" : profile.japaneseLevel === "lower-intermediate" ? "초중급" : "아직 설정하지 않음"} />
          <Row label="목표" value={getLearningGoalLabel(profile.learningGoal)} />
          <Row label="Supabase" value={isSupabaseConfigured ? "환경 변수 연결됨" : "아직 설정되지 않음"} />
        </div>
      </div>

      <button onClick={() => void signOut()} className="rounded-2xl border border-white/10 px-4 py-3 text-left text-stone-100">
        로그아웃
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-black/20 px-4 py-3">
      <span className="text-stone-400">{label}</span>
      <span className="text-right text-stone-100">{value}</span>
    </div>
  );
}
