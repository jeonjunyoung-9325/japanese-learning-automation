"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useApp } from "@/components/auth/app-provider";

export function AppChrome({ children }: { children: ReactNode }) {
  const { loading, profile } = useApp();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-stone-300">불러오는 중...</div>;
  }

  if (!profile?.onboardingCompleted) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <div className="max-w-sm rounded-[28px] border border-white/10 bg-white/5 p-6 text-center">
          <h1 className="text-xl font-semibold text-white">앱을 열려면 설정을 마쳐 주세요</h1>
          <p className="mt-2 text-sm text-stone-300">온보딩은 첫 화면에서 간단하게 끝낼 수 있도록 구성했습니다.</p>
          <Link href="/" className="mt-5 inline-flex rounded-2xl bg-orange-400 px-4 py-3 font-semibold text-stone-950">
            온보딩으로 이동
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-28 pt-5">
      {children}
      <BottomNav />
    </main>
  );
}
