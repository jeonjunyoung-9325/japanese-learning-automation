import { describe, expect, it } from "vitest";
import { getRuleBasedFeedback } from "@/lib/feedbackEngine/ruleBasedEngine";

describe("getRuleBasedFeedback", () => {
  it("rewards close matches to the target answer", () => {
    const feedback = getRuleBasedFeedback({
      answer: "アイスコーヒーをお願いします。",
      targetAnswer: "アイスコーヒーをお願いします。",
      instructionKo: "아이스커피를 주문하세요.",
      expressions: [
        {
          id: "exp-1",
          japanese: "アイスコーヒーをお願いします",
          reading: "あいすこーひーをおねがいします",
          meaningKo: "아이스커피 주세요",
          notesKo: "기본 주문형",
        },
      ],
    });

    expect(feedback.overallScore).toBeGreaterThanOrEqual(90);
    expect(feedback.matchedExpressions).toContain("アイスコーヒーをお願いします");
    expect(feedback.correctedSentence).toBe("アイスコーヒーをお願いします。");
  });

  it("marks missing expressions as weak", () => {
    const feedback = getRuleBasedFeedback({
      answer: "コーヒーください。",
      targetAnswer: "アイスコーヒーをお願いします。",
      instructionKo: "아이스커피를 주문하세요.",
      expressions: [
        {
          id: "exp-1",
          japanese: "アイスコーヒーをお願いします",
          reading: "あいすこーひーをおねがいします",
          meaningKo: "아이스커피 주세요",
          notesKo: "기본 주문형",
        },
      ],
    });

    expect(feedback.overallScore).toBeLessThan(70);
    expect(feedback.weakExpressions).toContain("アイスコーヒーをお願いします");
  });

  it("penalizes answers that miss particles and polite endings", () => {
    const feedback = getRuleBasedFeedback({
      answer: "ソウル 働いている",
      targetAnswer: "ソウルで働いています。",
      instructionKo: "서울에서 일한다고 말해 보세요.",
      expressions: [
        {
          id: "exp-1",
          japanese: "ソウルで働いています",
          reading: "そうるではたらいています",
          meaningKo: "서울에서 일하고 있습니다",
          notesKo: "장소 조사와 정중형",
        },
      ],
    });

    expect(feedback.scores.grammar).toBeLessThan(60);
    expect(feedback.overallScore).toBeLessThan(65);
  });

  it("keeps favorite speech-recognition-like spacing noise from tanking the score", () => {
    const feedback = getRuleBasedFeedback({
      answer: "アイス コーヒー を お願いします",
      targetAnswer: "アイスコーヒーをお願いします。",
      instructionKo: "아이스커피를 주문하세요.",
      expressions: [
        {
          id: "exp-1",
          japanese: "アイスコーヒーをお願いします",
          reading: "あいすこーひーをおねがいします",
          meaningKo: "아이스커피 주세요",
          notesKo: "기본 주문형",
        },
      ],
    });

    expect(feedback.overallScore).toBeGreaterThanOrEqual(80);
    expect(feedback.matchedExpressions).toContain("アイスコーヒーをお願いします");
  });
});
