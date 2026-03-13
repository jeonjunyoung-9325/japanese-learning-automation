"use client";

import { useState } from "react";
import { DailyRoutine } from "@/lib/types";

type GenerateResponse = {
  ok: boolean;
  duplicate: boolean;
  message: string;
  routine?: DailyRoutine;
};

export function GenerateButton() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleGenerate() {
    setPending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
      });
      const data = (await response.json()) as GenerateResponse;
      setMessage(data.message);
      if (data.ok) {
        if (data.routine) {
          window.localStorage.setItem(`dailyRoutine:${data.routine.date}`, JSON.stringify(data.routine));
        }
        window.location.reload();
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown error";
      setMessage(`생성 요청에 실패했습니다: ${detail}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <button
        onClick={handleGenerate}
        disabled={pending}
        style={{
          border: "none",
          borderRadius: 999,
          padding: "14px 20px",
          background: "var(--accent)",
          color: "white",
          fontWeight: 700,
          cursor: pending ? "wait" : "pointer",
          boxShadow: "var(--shadow)",
        }}
      >
        {pending ? "오늘 학습 생성 중..." : "오늘 학습 수동 생성"}
      </button>
      {message ? (
        <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>{message}</p>
      ) : null}
    </div>
  );
}
