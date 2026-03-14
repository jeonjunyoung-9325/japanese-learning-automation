import { LessonPracticeScreen } from "@/components/lesson/lesson-practice-screen";

export default async function LessonPracticePage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;

  return <LessonPracticeScreen lessonId={lessonId} />;
}
