import type { Difficulty, LearningGoal, Lesson, ReviewState } from "@/lib/types";

const categoryLabels: Record<string, string> = {
  all: "전체",
  "self introduction": "자기소개",
  cafe: "카페",
  "convenience store": "편의점",
  restaurant: "식당",
  directions: "길 찾기",
  "train station": "기차역",
  shopping: "쇼핑",
  hotel: "호텔",
  "workplace basics": "직장 기초",
  "daily small talk": "일상 스몰토크",
  travel: "여행",
  "JLPT support": "JLPT 대비",
};

const difficultyLabels: Record<Difficulty, string> = {
  "complete-beginner": "완전 초급",
  beginner: "초급",
  "lower-intermediate": "초중급",
};

const learningGoalLabels: Record<LearningGoal, string> = {
  travel: "여행",
  "daily-conversation": "일상 회화",
  work: "업무",
  "jlpt-support": "JLPT 대비",
};

const reviewStateLabels: Record<ReviewState, string> = {
  new: "신규",
  weak: "취약",
  improving: "향상 중",
  mastered: "숙달",
};

const lessonTitleLabels: Record<string, string> = {
  "self-intro-name": "간단한 자기소개",
  "self-intro-job": "직업 소개하기",
  "cafe-order": "커피 주문하기",
  "cafe-custom": "얼음 적게 요청하기",
  "convenience-pay": "편의점에서 계산하기",
  "convenience-ask": "물건 위치 묻기",
  "restaurant-table": "자리 요청하기",
  "restaurant-order": "세트 메뉴 주문하기",
  "directions-station": "역 가는 길 묻기",
  "directions-restroom": "화장실 위치 묻기",
  "station-ticket": "표 사기",
  "station-transfer": "환승 여부 묻기",
  "shopping-size": "다른 사이즈 요청하기",
  "shopping-checkout": "옷 계산하기",
  "hotel-checkin": "호텔 체크인하기",
  "hotel-help": "프런트에 도움 요청하기",
  "workplace-greeting": "동료에게 인사하기",
  "workplace-meeting": "간단한 회의 표현",
  "small-talk-weather": "날씨로 대화 시작하기",
  "small-talk-weekend": "주말 계획 말하기",
  "daily-greeting-neighbor": "이웃과 짧게 대화하기",
  "travel-airport": "공항 카운터에서 말하기",
  "jlpt-speaking-support": "이유를 짧게 설명하기",
};

const lessonGoalLabels: Record<string, string> = {
  "self-intro-name": "이름과 출신지를 정중하게 말하는 연습",
  "self-intro-job": "직업이나 역할을 한 문장으로 소개하기",
  "cafe-order": "음료 한 잔을 자연스럽게 주문하기",
  "cafe-custom": "간단한 옵션 변경 요청하기",
  "convenience-pay": "계산대 질문에 짧게 대답하기",
  "convenience-ask": "물건이 어디 있는지 물어보기",
  "restaurant-table": "인원 수를 자연스럽게 말하기",
  "restaurant-order": "음식과 음료를 정중하게 주문하기",
  "directions-station": "역까지 가는 길 묻기",
  "directions-restroom": "화장실 위치 정중하게 묻기",
  "station-ticket": "표 가격을 물어보고 구매하기",
  "station-transfer": "환승이 필요한지 물어보기",
  "shopping-size": "다른 사이즈가 있는지 요청하기",
  "shopping-checkout": "계산과 면세 요청하기",
  "hotel-checkin": "예약 여부와 기본 정보를 말하기",
  "hotel-help": "수건이나 체크아웃 연장 요청하기",
  "workplace-greeting": "직장에서 자주 쓰는 인사 표현 익히기",
  "workplace-meeting": "회의에서 짧게 반응하고 질문하기",
  "small-talk-weather": "날씨로 가볍게 대화 시작하기",
  "small-talk-weekend": "주말 계획 한 가지 말하기",
  "daily-greeting-neighbor": "이웃에게 인사하고 한마디 더하기",
  "travel-airport": "수하물과 탑승 시간을 물어보기",
  "jlpt-speaking-support": "から를 써서 이유를 짧게 말하기",
};

export function getCategoryLabel(category: string) {
  return categoryLabels[category] ?? category;
}

export function getDifficultyLabel(difficulty: Difficulty) {
  return difficultyLabels[difficulty];
}

export function getLearningGoalLabel(goal?: LearningGoal) {
  return goal ? learningGoalLabels[goal] : "아직 설정하지 않음";
}

export function getReviewStateLabel(state: ReviewState) {
  return reviewStateLabels[state];
}

export function getLessonTitleLabel(lesson: Lesson) {
  return lessonTitleLabels[lesson.id] ?? lesson.title;
}

export function getLessonGoalLabel(lesson: Lesson) {
  return lessonGoalLabels[lesson.id] ?? lesson.lessonGoal;
}
