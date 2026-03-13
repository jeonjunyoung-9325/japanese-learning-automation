import crypto from "node:crypto";
import { getCurrentDateInTimezone } from "@/lib/date";
import { getConfig } from "@/lib/env";
import { syncRoutineToNotion } from "@/lib/notion";
import { generateLessonWithOpenAI } from "@/lib/openai";
import { readStore, writeStore } from "@/lib/store";
import { DailyRoutine, LessonGenerationPayload, NotionPageIds } from "@/lib/types";

type GenerationResult = {
  duplicate: boolean;
  message: string;
  routine: DailyRoutine;
};

export async function runDailyGeneration(): Promise<GenerationResult> {
  const config = getConfig();
  const today = getCurrentDateInTimezone(config.timezone);
  const idempotencyKey = `daily-routine:${today}`;
  const store = await readStore();

  const existingRoutine = store.routinesByDate[today];
  if (existingRoutine) {
    if (!config.skipNotionSync && needsNotionSync(existingRoutine)) {
      const notionPageIds = await syncRoutineToNotion(existingRoutine);
      applyNotionSyncResult(existingRoutine, notionPageIds);
      store.routinesByDate[today] = existingRoutine;
    }

    store.generationLog.push({
      date: today,
      idempotencyKey,
      generatedAt: new Date().toISOString(),
      duplicate: true,
      routineId: existingRoutine.id,
    });
    await writeStore(store);

    return {
      duplicate: true,
      message: `${today} 루틴이 이미 생성되어 있어 기존 데이터를 반환합니다.`,
      routine: existingRoutine,
    };
  }

  const recentRoutines = Object.values(store.routinesByDate)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 14);

  const payload = await generateLessonWithOpenAI({
    date: today,
    recentThemes: recentRoutines.map((item) => item.theme),
    recentVocabulary: recentRoutines.flatMap((item) => item.vocabulary.map((vocab) => vocab.japanese)),
  });

  rejectDuplicateVocabulary(payload, recentRoutines);

  const routine = buildRoutine(today, payload);
  const notionPageIds = await syncRoutineToNotion(routine);
  applyNotionSyncResult(routine, notionPageIds);

  store.routinesByDate[today] = routine;
  store.generationLog.push({
    date: today,
    idempotencyKey,
    generatedAt: new Date().toISOString(),
    duplicate: false,
    routineId: routine.id,
  });
  await writeStore(store);

  return {
    duplicate: false,
    message: `${today} 루틴 생성과 저장이 완료되었습니다.`,
    routine,
  };
}

export async function rerunTodayNotionSync(inputRoutine?: DailyRoutine): Promise<GenerationResult> {
  const config = getConfig();
  const today = getCurrentDateInTimezone(config.timezone);

  if (config.skipNotionSync) {
    throw new Error("NOTION_SKIP_SYNC=true 상태라 Notion 재적재를 실행할 수 없습니다.");
  }

  const store = await readStore();
  const existingRoutine = store.routinesByDate[today] ?? getProvidedTodayRoutine(inputRoutine, today);

  if (!existingRoutine) {
    throw new Error("오늘 생성된 루틴이 없습니다. 먼저 오늘 학습을 생성해주세요.");
  }

  const notionPageIds = await syncRoutineToNotion(existingRoutine);
  applyNotionSyncResult(existingRoutine, notionPageIds);
  store.routinesByDate[today] = existingRoutine;
  store.generationLog.push({
    date: today,
    idempotencyKey: `notion-resync:${today}`,
    generatedAt: new Date().toISOString(),
    duplicate: true,
    routineId: existingRoutine.id,
  });
  await writeStore(store);

  return {
    duplicate: true,
    message: `${today} 루틴을 Notion에 다시 적재했습니다.`,
    routine: existingRoutine,
  };
}

function getProvidedTodayRoutine(routine: DailyRoutine | undefined, today: string) {
  if (!routine || routine.date !== today) {
    return null;
  }

  return routine;
}

function buildRoutine(date: string, payload: LessonGenerationPayload): DailyRoutine {
  const totalXp = payload.quests.reduce((sum, item) => sum + item.xpReward, 0);
  const earnedXp = calculateEarnedXp(payload.quests);

  return {
    id: crypto.createHash("sha256").update(`routine:${date}`).digest("hex").slice(0, 16),
    date,
    theme: payload.theme,
    summary: payload.summary,
    totalXp,
    earnedXp,
    vocabulary: payload.vocabulary,
    quests: payload.quests,
    createdAt: new Date().toISOString(),
  };
}

function rejectDuplicateVocabulary(payload: LessonGenerationPayload, recentRoutines: DailyRoutine[]) {
  const recentVocabularyHashes = new Set(
    recentRoutines.flatMap((routine) =>
      routine.vocabulary.map((item) => normalizeText(`${item.japanese}:${item.reading}`)),
    ),
  );

  for (const item of payload.vocabulary) {
    const normalized = normalizeText(`${item.japanese}:${item.reading}`);
    if (recentVocabularyHashes.has(normalized)) {
      throw new Error(
        `중복 어휘가 감지되었습니다: ${item.japanese} (${item.reading}). 프롬프트 제외 목록을 늘리거나 mock 데이터를 변경하세요.`,
      );
    }
  }
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}

function needsNotionSync(routine: DailyRoutine) {
  return !routine.notionPageIds?.dailyRoutinePageId;
}

function applyNotionSyncResult(routine: DailyRoutine, notionPageIds: NotionPageIds) {
  routine.notionPageIds = notionPageIds;
  routine.notionSyncHistory = [
    ...(routine.notionSyncHistory ?? []),
    {
      syncedAt: new Date().toISOString(),
      notionPageIds,
    },
  ];
}

function calculateEarnedXp(quests: LessonGenerationPayload["quests"]) {
  return quests
    .filter((quest) => quest.status === "COMPLETED")
    .reduce((sum, quest) => sum + quest.xpReward, 0);
}
