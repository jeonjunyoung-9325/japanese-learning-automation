"use client";

import { useState } from "react";

type SyncResponse = {
  ok: boolean;
  message: string;
};

export function SyncProgressButton() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSync() {
    setPending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/sync-progress", {
        method: "POST",
      });
      const data = (await response.json()) as SyncResponse;
      setMessage(data.message);
      if (data.ok) {
        window.location.reload();
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown error";
      setMessage(`진행 동기화에 실패했습니다: ${detail}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <button
        onClick={handleSync}
        disabled={pending}
        style={{
          border: "1px solid var(--line)",
          borderRadius: 999,
          padding: "14px 20px",
          background: "rgba(255,255,255,0.7)",
          color: "var(--ink)",
          fontWeight: 700,
          cursor: pending ? "wait" : "pointer",
        }}
      >
        {pending ? "퀘스트 진행 동기화 중..." : "퀘스트 진행 동기화"}
      </button>
      {message ? (
        <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>{message}</p>
      ) : null}
    </div>
  );
}
