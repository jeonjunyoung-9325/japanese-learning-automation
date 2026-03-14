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

    expect(feedback.overallScore).toBeGreaterThanOrEqual(80);
    expect(feedback.matchedExpressions).toContain("アイスコーヒーをお願いします");
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

    expect(feedback.overallScore).toBeLessThan(80);
    expect(feedback.weakExpressions).toContain("アイスコーヒーをお願いします");
  });
});
