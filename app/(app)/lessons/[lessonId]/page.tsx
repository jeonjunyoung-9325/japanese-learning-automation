import { LessonPracticeScreen } from "@/components/lesson/lesson-practice-screen";

export default async function LessonPracticePage({
  params,
  searchParams,
}: {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ prompt?: string }>;
}) {
  const { lessonId } = await params;
  const { prompt } = await searchParams;

  return <LessonPracticeScreen lessonId={lessonId} initialPromptId={prompt} />;
}
