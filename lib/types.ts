export type VocabularyItem = {
  id: string;
  japanese: string;
  reading: string;
  meaning: string;
  example: string;
  exampleReading: string;
  exampleMeaning: string;
};

export type QuestItem = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  status: "ACTIVE" | "COMPLETED";
};

export type NotionPageIds = {
  dailyRoutinePageId?: string;
  vocabularyPageIds: string[];
  questPageIds: string[];
};

export type NotionSyncHistoryItem = {
  syncedAt: string;
  notionPageIds: NotionPageIds;
};

export type DailyRoutine = {
  id: string;
  date: string;
  theme: string;
  summary: string;
  totalXp: number;
  earnedXp: number;
  vocabulary: VocabularyItem[];
  quests: QuestItem[];
  createdAt: string;
  notionPageIds?: NotionPageIds;
  notionSyncHistory?: NotionSyncHistoryItem[];
};

export type StoreShape = {
  routinesByDate: Record<string, DailyRoutine>;
  generationLog: Array<{
    date: string;
    idempotencyKey: string;
    generatedAt: string;
    duplicate: boolean;
    routineId?: string;
  }>;
};

export type LessonGenerationPayload = {
  theme: string;
  summary: string;
  vocabulary: VocabularyItem[];
  quests: QuestItem[];
};
