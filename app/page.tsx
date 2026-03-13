import { GenerateButton } from "@/components/generate-button";
import { SyncProgressButton } from "@/components/sync-progress-button";
import { getCurrentDateInTimezone } from "@/lib/date";
import { getConfig } from "@/lib/env";
import { readStore } from "@/lib/store";

export default async function HomePage() {
  const config = getConfig();
  const today = getCurrentDateInTimezone(config.timezone);
  const store = await readStore();
  const routine = store.routinesByDate[today];

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "48px 20px 80px",
      }}
    >
      <section
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          display: "grid",
          gap: 24,
        }}
      >
        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            borderRadius: 28,
            padding: 28,
            boxShadow: "var(--shadow)",
          }}
        >
          <p style={{ margin: 0, color: "var(--accent)", fontWeight: 700 }}>Japanese Daily Quest</p>
          <h1 style={{ margin: "8px 0 12px", fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
            오늘의 일본어 루틴 자동화
          </h1>
          <p style={{ margin: 0, maxWidth: 720, color: "var(--muted)", lineHeight: 1.6 }}>
            초급 학습자를 위한 오늘의 어휘, 예문, 퀘스트를 OpenAI로 생성하고 Notion DB에 적재합니다.
            한자에는 후리가나를, 가타카나에는 히라가나 읽기 보조를 함께 저장합니다.
          </p>
          <div
            style={{
              marginTop: 20,
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, max-content))",
            }}
          >
            <GenerateButton />
            <SyncProgressButton />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          <StatCard title="오늘 날짜" value={today} description={`Timezone: ${config.timezone}`} />
          <StatCard
            title="Notion 동기화"
            value={config.skipNotionSync ? "Skip" : "Active"}
            description={
              config.skipNotionSync
                ? "NOTION_SKIP_SYNC=true 상태입니다."
                : "Daily Routine / Vocabulary / Quest Tracker DB에 저장합니다."
            }
          />
          <StatCard
            title="OpenAI 생성"
            value={config.openAiMockEnabled ? "Mock" : "Live"}
            description={
              config.openAiMockEnabled
                ? "OPENAI_ENABLE_MOCK=true 상태입니다."
                : `Model: ${config.openAiModel}`
            }
          />
        </div>

        <section
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "2fr 1fr",
          }}
        >
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: 24,
              padding: 24,
            }}
          >
            <h2 style={{ marginTop: 0 }}>오늘의 루틴</h2>
            {routine ? (
              <div style={{ display: "grid", gap: 16 }}>
                <div>
                  <p style={{ margin: "0 0 8px", color: "var(--muted)" }}>주제</p>
                  <h3 style={{ margin: 0 }}>{routine.theme}</h3>
                </div>
                <div>
                  <p style={{ margin: "0 0 8px", color: "var(--muted)" }}>요약</p>
                  <p style={{ margin: 0, lineHeight: 1.7 }}>{routine.summary}</p>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 12,
                  }}
                >
                  <div>
                    <p style={{ margin: "0 0 8px", color: "var(--muted)" }}>총 XP</p>
                    <strong>{routine.totalXp} XP</strong>
                  </div>
                  <div>
                    <p style={{ margin: "0 0 8px", color: "var(--muted)" }}>획득 XP</p>
                    <strong>{routine.earnedXp ?? 0} XP</strong>
                  </div>
                </div>
                <div>
                  <p style={{ margin: "0 0 8px", color: "var(--muted)" }}>오늘의 어휘</p>
                  <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8 }}>
                    {routine.vocabulary.map((item) => (
                      <li key={item.id}>
                        <strong>{item.japanese}</strong> ({item.reading}) - {item.meaning}
                        <div style={{ color: "var(--muted)", marginTop: 4 }}>
                          {item.example}
                          <br />
                          {item.exampleReading}
                          <br />
                          {item.exampleMeaning || "예문 뜻 없음"}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p style={{ margin: 0, color: "var(--muted)" }}>
                아직 오늘 루틴이 생성되지 않았습니다. 버튼을 눌러 생성하거나 cron을 호출하세요.
              </p>
            )}
          </div>

          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: 24,
              padding: 24,
            }}
          >
            <h2 style={{ marginTop: 0 }}>퀘스트 요약</h2>
            {routine ? (
              <div style={{ display: "grid", gap: 14 }}>
                {routine.quests.map((quest) => (
                  <div
                    key={quest.id}
                    style={{
                      border: "1px solid var(--line)",
                      borderRadius: 18,
                      padding: 14,
                      background: "rgba(255,255,255,0.55)",
                    }}
                  >
                    <strong>{quest.title}</strong>
                    <p style={{ margin: "6px 0", color: "var(--muted)" }}>{quest.description}</p>
                    <span style={{ color: "var(--accent-2)", fontWeight: 700 }}>{quest.xpReward} XP</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: "var(--muted)" }}>오늘 퀘스트가 아직 없습니다.</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function StatCard(props: { title: string; value: string; description: string }) {
  return (
    <div
      style={{
        background: "var(--panel)",
        border: "1px solid var(--line)",
        borderRadius: 24,
        padding: 20,
      }}
    >
      <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>{props.title}</p>
      <h2 style={{ margin: "6px 0 10px" }}>{props.value}</h2>
      <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>{props.description}</p>
    </div>
  );
}
