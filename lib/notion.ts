import { Client } from "@notionhq/client";
import { getConfig } from "@/lib/env";
import { DailyRoutine } from "@/lib/types";

const databasePropertyCache = new Map<string, Set<string>>();

function getNotionClient() {
  const config = getConfig();

  if (!config.notionToken) {
    throw new Error("NOTION_TOKEN is missing.");
  }

  return new Client({
    auth: config.notionToken,
  });
}

function title(text: string) {
  return [
    {
      type: "text" as const,
      text: {
        content: text,
      },
    },
  ];
}

function richText(text: string) {
  return [
    {
      type: "text" as const,
      text: {
        content: text,
      },
    },
  ];
}

function getQuestCheckboxPropertyName(propertyNames: Set<string>) {
  if (propertyNames.has("완료")) {
    return "완료";
  }

  if (propertyNames.has("체크")) {
    return "체크";
  }

  return null;
}

async function getDatabasePropertyNames(notion: Client, databaseId: string) {
  const cached = databasePropertyCache.get(databaseId);
  if (cached) {
    return cached;
  }

  const database = await notion.databases.retrieve({
    database_id: databaseId,
  });
  const propertyNames = new Set(Object.keys((database as { properties: Record<string, unknown> }).properties));
  databasePropertyCache.set(databaseId, propertyNames);
  return propertyNames;
}

export async function syncRoutineToNotion(routine: DailyRoutine) {
  const config = getConfig();

  if (config.skipNotionSync) {
    return {
      dailyRoutinePageId: undefined,
      vocabularyPageIds: [],
      questPageIds: [],
    };
  }

  if (
    !config.notionDailyRoutineDbId ||
    !config.notionVocabularyDbId ||
    !config.notionQuestTrackerDbId
  ) {
    throw new Error("Notion database IDs are missing.");
  }

  const notion = getNotionClient();
  const dailyPropertyNames = await getDatabasePropertyNames(notion, config.notionDailyRoutineDbId);
  const vocabPropertyNames = await getDatabasePropertyNames(notion, config.notionVocabularyDbId);
  const questPropertyNames = await getDatabasePropertyNames(notion, config.notionQuestTrackerDbId);
  const questCheckboxPropertyName = getQuestCheckboxPropertyName(questPropertyNames);

  const dailyProperties: Record<string, any> = {};
  if (dailyPropertyNames.has("이름")) {
    dailyProperties["이름"] = { title: title(`${routine.date} 일일 루틴`) };
  }
  if (dailyPropertyNames.has("날짜")) {
    dailyProperties["날짜"] = { date: { start: routine.date } };
  }
  if (dailyPropertyNames.has("주제")) {
    dailyProperties["주제"] = { rich_text: richText(routine.theme) };
  }
  if (dailyPropertyNames.has("요약")) {
    dailyProperties["요약"] = { rich_text: richText(routine.summary) };
  }
  if (dailyPropertyNames.has("상태")) {
    dailyProperties["상태"] = { select: { name: "생성됨" } };
  }
  if (dailyPropertyNames.has("총 XP")) {
    dailyProperties["총 XP"] = { number: routine.totalXp };
  }
  if (dailyPropertyNames.has("획득 XP")) {
    dailyProperties["획득 XP"] = { number: routine.earnedXp };
  }
  if (dailyPropertyNames.has("루틴 ID")) {
    dailyProperties["루틴 ID"] = { rich_text: richText(routine.id) };
  }

  const dailyPage = await notion.pages.create({
    parent: { database_id: config.notionDailyRoutineDbId },
    properties: dailyProperties,
  });

  const vocabularyPageIds: string[] = [];

  for (const item of routine.vocabulary) {
    const vocabularyProperties: Record<string, any> = {};
    if (vocabPropertyNames.has("이름")) {
      vocabularyProperties["이름"] = { title: title(item.japanese) };
    }
    if (vocabPropertyNames.has("날짜")) {
      vocabularyProperties["날짜"] = { date: { start: routine.date } };
    }
    if (vocabPropertyNames.has("일본어")) {
      vocabularyProperties["일본어"] = { rich_text: richText(item.japanese) };
    }
    if (vocabPropertyNames.has("읽기")) {
      vocabularyProperties["읽기"] = { rich_text: richText(item.reading) };
    }
    if (vocabPropertyNames.has("뜻")) {
      vocabularyProperties["뜻"] = { rich_text: richText(item.meaning) };
    }
    if (vocabPropertyNames.has("예문")) {
      vocabularyProperties["예문"] = { rich_text: richText(item.example) };
    }
    if (vocabPropertyNames.has("예문 읽기")) {
      vocabularyProperties["예문 읽기"] = { rich_text: richText(item.exampleReading) };
    }
    if (vocabPropertyNames.has("예문 뜻")) {
      vocabularyProperties["예문 뜻"] = { rich_text: richText(item.exampleMeaning) };
    }
    if (vocabPropertyNames.has("루틴 ID")) {
      vocabularyProperties["루틴 ID"] = { rich_text: richText(routine.id) };
    }

    const page = await notion.pages.create({
      parent: { database_id: config.notionVocabularyDbId },
      properties: vocabularyProperties,
    });
    vocabularyPageIds.push(page.id);
  }

  const questPageIds: string[] = [];

  for (const quest of routine.quests) {
    const questProperties: Record<string, any> = {};
    if (questPropertyNames.has("이름")) {
      questProperties["이름"] = { title: title(quest.title) };
    }
    if (questPropertyNames.has("날짜")) {
      questProperties["날짜"] = { date: { start: routine.date } };
    }
    if (questPropertyNames.has("설명")) {
      questProperties["설명"] = { rich_text: richText(quest.description) };
    }
    if (questPropertyNames.has("XP")) {
      questProperties["XP"] = { number: quest.xpReward };
    }
    if (questPropertyNames.has("상태")) {
      questProperties["상태"] = {
        select: { name: quest.status === "ACTIVE" ? "진행중" : "완료" },
      };
    }
    if (questCheckboxPropertyName) {
      questProperties[questCheckboxPropertyName] = { checkbox: quest.status === "COMPLETED" };
    }
    if (questPropertyNames.has("루틴 ID")) {
      questProperties["루틴 ID"] = { rich_text: richText(routine.id) };
    }

    const page = await notion.pages.create({
      parent: { database_id: config.notionQuestTrackerDbId },
      properties: questProperties,
    });
    questPageIds.push(page.id);
  }

  return {
    dailyRoutinePageId: dailyPage.id,
    vocabularyPageIds,
    questPageIds,
  };
}

export async function syncRoutineProgressFromNotion(routine: DailyRoutine): Promise<DailyRoutine> {
  const config = getConfig();

  if (config.skipNotionSync || !routine.notionPageIds?.dailyRoutinePageId) {
    return routine;
  }

  const notion = getNotionClient();
  const updatedQuests = await Promise.all(
    routine.quests.map(async (quest, index) => {
      const pageId = routine.notionPageIds?.questPageIds[index];
      if (!pageId) {
        return quest;
      }

      const page = await notion.pages.retrieve({ page_id: pageId });
      const properties = (page as { properties?: Record<string, unknown> }).properties ?? {};
      const checkboxCompleted =
        (properties["완료"] as { checkbox?: boolean } | undefined)?.checkbox ??
        (properties["체크"] as { checkbox?: boolean } | undefined)?.checkbox;
      const statusName = (properties["상태"] as { select?: { name?: string } } | undefined)?.select?.name;
      const xpValue = (properties["XP"] as { number?: number } | undefined)?.number;
      const isCompleted =
        typeof checkboxCompleted === "boolean"
          ? checkboxCompleted
          : statusName === "완료" || statusName === "COMPLETED";

      if (typeof checkboxCompleted === "boolean" && statusName && statusName !== (isCompleted ? "완료" : "진행중")) {
        await notion.pages.update({
          page_id: pageId,
          properties: {
            상태: { select: { name: isCompleted ? "완료" : "진행중" } },
          },
        });
      }

      return {
        ...quest,
        xpReward: typeof xpValue === "number" ? xpValue : quest.xpReward,
        status: (isCompleted ? "COMPLETED" : "ACTIVE") as "COMPLETED" | "ACTIVE",
      };
    }),
  );

  const earnedXp = updatedQuests
    .filter((quest) => quest.status === "COMPLETED")
    .reduce((sum, quest) => sum + quest.xpReward, 0);

  await notion.pages.update({
    page_id: routine.notionPageIds.dailyRoutinePageId,
    properties: {
      "획득 XP": { number: earnedXp },
    },
  });

  return {
    ...routine,
    earnedXp,
    quests: updatedQuests,
  };
}
