import OpenAI from "openai";
import { getConfig } from "@/lib/env";
import { LessonGenerationPayload } from "@/lib/types";

const mockPayloads: LessonGenerationPayload[] = [
  {
    theme: "카페에서 주문하기",
    summary:
      "오늘은 카페에서 자주 쓰는 초급 표현을 학습합니다. 짧은 문장과 쉬운 명사를 중심으로 읽기와 반복 학습에 집중합니다.",
    vocabulary: [
      {
        id: "vocab-coffee",
        japanese: "コーヒー",
        reading: "こうひい",
        meaning: "커피",
        example: "コーヒーを一つお願いします。",
        exampleReading: "こうひいをひとつおねがいします。",
        exampleMeaning: "커피 한 잔 부탁합니다.",
      },
      {
        id: "vocab-water",
        japanese: "水",
        reading: "みず",
        meaning: "물",
        example: "水をください。",
        exampleReading: "みずをください。",
        exampleMeaning: "물을 주세요.",
      },
      {
        id: "vocab-cake",
        japanese: "ケーキ",
        reading: "けえき",
        meaning: "케이크",
        example: "ケーキはありますか。",
        exampleReading: "けえきはありますか。",
        exampleMeaning: "케이크가 있나요?",
      },
      {
        id: "vocab-menu",
        japanese: "メニュー",
        reading: "めにゅう",
        meaning: "메뉴",
        example: "メニューを見せてください。",
        exampleReading: "めにゅうをみせてください。",
        exampleMeaning: "메뉴를 보여주세요.",
      },
      {
        id: "vocab-shop",
        japanese: "店",
        reading: "みせ",
        meaning: "가게",
        example: "この店は静かです。",
        exampleReading: "このみせはしずかです。",
        exampleMeaning: "이 가게는 조용합니다.",
      },
    ],
    quests: [
      {
        id: "quest-vocab-5",
        title: "단어 5개 익히기",
        description: "오늘의 어휘 5개를 읽고 뜻을 확인합니다.",
        xpReward: 20,
        status: "ACTIVE",
      },
      {
        id: "quest-read-aloud",
        title: "예문 소리 내어 읽기",
        description: "예문 3개를 후리가나를 보면서 한 번씩 읽습니다.",
        xpReward: 30,
        status: "ACTIVE",
      },
      {
        id: "quest-review",
        title: "복습 체크",
        description: "오늘 학습한 단어 중 3개를 다시 떠올려 봅니다.",
        xpReward: 20,
        status: "ACTIVE",
      },
    ],
  },
  {
    theme: "역에서 길 묻기",
    summary:
      "오늘은 역과 길 안내 표현을 학습합니다. 장소 명사와 짧은 질문 표현을 익히며 읽기 부담을 낮춘 초급 루틴입니다.",
    vocabulary: [
      {
        id: "vocab-station",
        japanese: "駅",
        reading: "えき",
        meaning: "역",
        example: "駅はどこですか。",
        exampleReading: "えきはどこですか。",
        exampleMeaning: "역은 어디인가요?",
      },
      {
        id: "vocab-right",
        japanese: "右",
        reading: "みぎ",
        meaning: "오른쪽",
        example: "右へ行きます。",
        exampleReading: "みぎへいきます。",
        exampleMeaning: "오른쪽으로 갑니다.",
      },
      {
        id: "vocab-left",
        japanese: "左",
        reading: "ひだり",
        meaning: "왼쪽",
        example: "左に曲がってください。",
        exampleReading: "ひだりにまがってください。",
        exampleMeaning: "왼쪽으로 돌아주세요.",
      },
      {
        id: "vocab-map",
        japanese: "マップ",
        reading: "まっぷ",
        meaning: "지도",
        example: "マップを見ます。",
        exampleReading: "まっぷをみます。",
        exampleMeaning: "지도를 봅니다.",
      },
      {
        id: "vocab-road",
        japanese: "道",
        reading: "みち",
        meaning: "길",
        example: "この道は広いです。",
        exampleReading: "このみちはひろいです。",
        exampleMeaning: "이 길은 넓습니다.",
      },
    ],
    quests: [
      {
        id: "quest-location",
        title: "장소 단어 익히기",
        description: "장소와 방향 단어 5개를 읽고 뜻을 확인합니다.",
        xpReward: 20,
        status: "ACTIVE",
      },
      {
        id: "quest-question",
        title: "길 묻는 문장 읽기",
        description: "질문 문장을 3번 읽고 입으로 따라 말합니다.",
        xpReward: 30,
        status: "ACTIVE",
      },
      {
        id: "quest-recall",
        title: "방향 단어 복습",
        description: "오른쪽과 왼쪽 표현을 구분해서 떠올립니다.",
        xpReward: 20,
        status: "ACTIVE",
      },
    ],
  },
  {
    theme: "편의점에서 물건 사기",
    summary:
      "오늘은 편의점에서 자주 쓰는 표현을 학습합니다. 물건, 가격, 계산 관련 단어를 짧은 예문으로 익힙니다.",
    vocabulary: [
      {
        id: "vocab-milk",
        japanese: "牛乳",
        reading: "ぎゅうにゅう",
        meaning: "우유",
        example: "牛乳を買います。",
        exampleReading: "ぎゅうにゅうをかいます。",
        exampleMeaning: "우유를 삽니다.",
      },
      {
        id: "vocab-bag",
        japanese: "袋",
        reading: "ふくろ",
        meaning: "봉투",
        example: "袋は要りますか。",
        exampleReading: "ふくろはいりますか。",
        exampleMeaning: "봉투가 필요하신가요?",
      },
      {
        id: "vocab-cashier",
        japanese: "レジ",
        reading: "れじ",
        meaning: "계산대",
        example: "レジはあちらです。",
        exampleReading: "れじはあちらです。",
        exampleMeaning: "계산대는 저쪽입니다.",
      },
      {
        id: "vocab-price",
        japanese: "値段",
        reading: "ねだん",
        meaning: "가격",
        example: "この値段は高いです。",
        exampleReading: "このねだんはたかいです。",
        exampleMeaning: "이 가격은 비쌉니다.",
      },
      {
        id: "vocab-money",
        japanese: "お金",
        reading: "おかね",
        meaning: "돈",
        example: "お金を払います。",
        exampleReading: "おかねをはらいます。",
        exampleMeaning: "돈을 냅니다.",
      },
    ],
    quests: [
      {
        id: "quest-shopping",
        title: "쇼핑 단어 읽기",
        description: "편의점 관련 단어 5개를 읽고 뜻을 확인합니다.",
        xpReward: 20,
        status: "ACTIVE",
      },
      {
        id: "quest-price",
        title: "가격 문장 이해하기",
        description: "가격과 계산 관련 예문을 소리 내어 읽습니다.",
        xpReward: 30,
        status: "ACTIVE",
      },
      {
        id: "quest-pay",
        title: "계산 표현 복습",
        description: "사기, 내기 표현을 다시 확인합니다.",
        xpReward: 20,
        status: "ACTIVE",
      },
    ],
  },
];

export async function generateLessonWithOpenAI(input: {
  date: string;
  recentThemes: string[];
  recentVocabulary: string[];
}): Promise<LessonGenerationPayload> {
  const config = getConfig();

  if (config.openAiMockEnabled) {
    return getMockPayload(input.date);
  }

  if (!config.openAiApiKey) {
    throw new Error("OPENAI_API_KEY is missing. Or set OPENAI_ENABLE_MOCK=true.");
  }

  const client = new OpenAI({
    apiKey: config.openAiApiKey,
  });

  const completion = await client.chat.completions.create({
    model: config.openAiModel,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You create beginner Japanese lessons for a Korean learner. Every kanji must include a hiragana reading in the reading fields. Katakana words must also include hiragana reading assistance. Prefer common beginner-friendly spellings over rare kanji variants, for example use コーヒー instead of 珈琲. Return only valid JSON.",
      },
      {
        role: "user",
        content: JSON.stringify({
          task: "Generate a daily Japanese lesson package.",
          learner: {
            level: "beginner",
            canRead: ["hiragana"],
            weakAt: ["katakana reading", "kanji reading"],
          },
          constraints: {
            date: input.date,
            vocabularyCount: 5,
            questCount: 3,
            outputLanguage: "Korean",
            excludeThemes: input.recentThemes,
            excludeVocabulary: input.recentVocabulary,
            requireFurigana: true,
            requireKatakanaAssist: true,
          },
          schema: {
            theme: "string",
            summary: "string",
            vocabulary: [
              {
                id: "string",
                japanese: "string",
                reading: "string",
                meaning: "string",
                example: "string",
                exampleReading: "string",
                exampleMeaning: "string",
              },
            ],
            quests: [
              {
                id: "string",
                title: "string",
                description: "string",
                xpReward: "number",
                status: '"ACTIVE"',
              },
            ],
          },
        }),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  const parsed = JSON.parse(content) as LessonGenerationPayload;
  validatePayload(parsed);
  return parsed;
}

function validatePayload(payload: LessonGenerationPayload) {
  if (!payload.theme || !payload.summary) {
    throw new Error("OpenAI payload is missing theme or summary.");
  }

  if (!Array.isArray(payload.vocabulary) || payload.vocabulary.length === 0) {
    throw new Error("OpenAI payload is missing vocabulary.");
  }

  for (const item of payload.vocabulary) {
    if (!item.exampleMeaning) {
      throw new Error("OpenAI payload is missing exampleMeaning in vocabulary.");
    }
  }

  if (!Array.isArray(payload.quests) || payload.quests.length === 0) {
    throw new Error("OpenAI payload is missing quests.");
  }
}

function getMockPayload(date: string): LessonGenerationPayload {
  const dayNumber = Number(date.split("-")[2] || "1");
  return mockPayloads[(dayNumber - 1) % mockPayloads.length];
}
