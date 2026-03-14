export function getTodayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function formatRelativeDateLabel(date: string): string {
  const today = getTodayKey();
  if (date === today) {
    return "오늘";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}
