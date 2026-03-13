type Config = {
  timezone: string;
  baseUrl: string;
  cronSecret: string;
  notionButtonSecret: string;
  openAiApiKey: string;
  openAiModel: string;
  openAiMockEnabled: boolean;
  notionToken: string;
  notionDailyRoutineDbId: string;
  notionVocabularyDbId: string;
  notionQuestTrackerDbId: string;
  skipNotionSync: boolean;
};

let cachedConfig: Config | null = null;

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) {
    return defaultValue;
  }

  return value.toLowerCase() === "true";
}

export function getConfig(): Config {
  if (cachedConfig) {
    return cachedConfig;
  }

  cachedConfig = {
    timezone: process.env.APP_TIMEZONE || "Asia/Seoul",
    baseUrl: process.env.APP_BASE_URL || "http://localhost:3000",
    cronSecret: process.env.CRON_SECRET || "",
    notionButtonSecret: process.env.NOTION_BUTTON_SECRET || process.env.CRON_SECRET || "",
    openAiApiKey: process.env.OPENAI_API_KEY || "",
    openAiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
    openAiMockEnabled: parseBoolean(process.env.OPENAI_ENABLE_MOCK, true),
    notionToken: process.env.NOTION_TOKEN || "",
    notionDailyRoutineDbId: process.env.NOTION_DAILY_ROUTINE_DB_ID || "",
    notionVocabularyDbId: process.env.NOTION_VOCABULARY_DB_ID || "",
    notionQuestTrackerDbId: process.env.NOTION_QUEST_TRACKER_DB_ID || "",
    skipNotionSync: parseBoolean(process.env.NOTION_SKIP_SYNC, true),
  };

  return cachedConfig;
}
