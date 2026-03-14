export type JapaneseLevel = "complete-beginner" | "beginner" | "lower-intermediate";
export type LearningGoal = "travel" | "daily-conversation" | "work" | "jlpt-support";
export type Difficulty = "complete-beginner" | "beginner" | "lower-intermediate";
export type ReviewState = "new" | "weak" | "improving" | "mastered";
export type InputMode = "text" | "voice";

export type UserProfile = {
  id: string;
  email?: string | null;
  displayName: string;
  japaneseLevel?: JapaneseLevel;
  learningGoal?: LearningGoal;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LessonPrompt = {
  id: string;
  situation: string;
  instructionKo: string;
  targetAnswer: string;
  targetReading: string;
  hints: string[];
  keyExpressionIds: string[];
};

export type LessonExpression = {
  id: string;
  japanese: string;
  reading: string;
  meaningKo: string;
  notesKo: string;
};

export type LessonDialogueTurn = {
  speaker: "staff" | "learner";
  japanese: string;
  reading: string;
  meaningKo: string;
};

export type Lesson = {
  id: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  lessonGoal: string;
  explanationKo: string;
  estimatedMinutes: number;
  expressions: LessonExpression[];
  miniDialogue: LessonDialogueTurn[];
  prompts: LessonPrompt[];
};

export type FeedbackBreakdown = {
  naturalness: number;
  grammar: number;
  vocabulary: number;
};

export type PracticeFeedback = {
  scores: FeedbackBreakdown;
  overallScore: number;
  correctedSentence: string;
  naturalAlternative: string;
  explanationKo: string;
  encouragement: string;
  matchedExpressions: string[];
  weakExpressions: string[];
};

export type PracticeAttempt = {
  id: string;
  lessonId: string;
  promptId: string;
  userId: string;
  answer: string;
  inputMode: InputMode;
  feedback: PracticeFeedback;
  createdAt: string;
};

export type ReviewItem = {
  id: string;
  userId: string;
  expression: string;
  meaningKo: string;
  lessonId: string;
  promptId: string;
  state: ReviewState;
  lastScore: number;
  updatedAt: string;
};

export type VocabularyWord = {
  id: string;
  japanese: string;
  reading: string;
  meaningKo: string;
  noteKo: string;
  category: string;
  difficulty: Difficulty;
  jlptLevel: "N5";
};

export type StudySentence = {
  id: string;
  japanese: string;
  reading: string;
  meaningKo: string;
  patternKo: string;
  category: string;
  difficulty: Difficulty;
  jlptLevel: "N5";
};

export type StudyPreferences = {
  favoriteWordIds: string[];
  masteredWordIds: string[];
  todayWordIds: string[];
  favoriteSentenceIds: string[];
  masteredSentenceIds: string[];
  todaySentenceIds: string[];
};

export type DailyProgress = {
  id: string;
  userId: string;
  date: string;
  attemptsCount: number;
  completedLessons: number;
  averageScore: number;
};

export type Streak = {
  id: string;
  userId: string;
  currentStreak: number;
  bestStreak: number;
  lastPracticeDate?: string | null;
};

export type DashboardStats = {
  recommendedLesson: Lesson;
  streak: number;
  completedLessons: number;
  averageScore: number;
  recentWeakExpressions: ReviewItem[];
};

export type AppMode = "guest" | "supabase";

export type PersistedAppState = {
  profile: UserProfile;
  attempts: PracticeAttempt[];
  reviewItems: ReviewItem[];
  dailyProgress: DailyProgress[];
  streak: Streak;
};
