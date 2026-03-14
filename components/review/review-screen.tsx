"use client";

import Link from "next/link";
import { useApp } from "@/components/auth/app-provider";
import { getReviewStateLabel } from "@/lib/utils/labels";

export function ReviewScreen() {
  const { reviewItems } = useApp();

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-orange-300">취약 표현</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">빠른 복습</h1>
        <p className="mt-2 text-sm text-stone-300">가볍게 다시 읽고, 소리 내어 말해 보고, 필요하면 원래 레슨으로 돌아가 보세요.</p>
      </div>

      {reviewItems.length > 0 ? (
        reviewItems.map((item) => (
          <div key={item.id} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-white">{item.expression}</h2>
              <span className="rounded-full bg-orange-400/15 px-3 py-1 text-xs uppercase tracking-[0.16em] text-orange-200">{getReviewStateLabel(item.state)}</span>
            </div>
            <p className="mt-2 text-sm text-stone-300">{item.meaningKo}</p>
            <p className="mt-2 text-xs text-stone-500">최근 점수: {item.lastScore}</p>
            <Link
              href={`/lessons/${item.lessonId}`}
              className="mt-4 inline-flex w-fit rounded-2xl bg-orange-400 px-5 py-3 font-semibold text-stone-950 shadow-lg shadow-orange-950/20"
            >
              레슨 다시 열기
            </Link>
          </div>
        ))
      ) : (
        <div className="rounded-[28px] border border-dashed border-white/10 p-6 text-sm text-stone-400">
          아직 복습할 항목이 없어요. 몇 개의 프롬프트를 풀다 보면 약한 표현이 자동으로 여기에 쌓입니다.
        </div>
      )}
    </div>
  );
}
