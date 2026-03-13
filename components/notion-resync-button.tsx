"use client";

import { useState } from "react";

type ResyncResponse = {
  ok: boolean;
  duplicate: boolean;
  message: string;
};

export function NotionResyncButton() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleResync() {
    setPending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/notion-resync", {
        method: "POST",
      });
      const data = (await response.json()) as ResyncResponse;
      setMessage(data.message);
      if (data.ok) {
        window.location.reload();
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown error";
      setMessage(`Notion 재적재 요청에 실패했습니다: ${detail}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <button
        onClick={handleResync}
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
        {pending ? "Notion 재적재 중..." : "오늘 내용 Notion 다시 적재"}
      </button>
      {message ? (
        <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>{message}</p>
      ) : null}
    </div>
  );
}
