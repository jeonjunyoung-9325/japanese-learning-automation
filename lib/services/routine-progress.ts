import { getCurrentDateInTimezone } from "@/lib/date";
import { getConfig } from "@/lib/env";
import { syncRoutineProgressFromNotion } from "@/lib/notion";
import { readStore, writeStore } from "@/lib/store";

export async function syncTodayRoutineProgress() {
  const config = getConfig();
  const today = getCurrentDateInTimezone(config.timezone);
  const store = await readStore();
  const routine = store.routinesByDate[today];

  if (!routine) {
    return null;
  }

  if (config.skipNotionSync) {
    return routine;
  }

  const syncedRoutine = await syncRoutineProgressFromNotion(routine);
  store.routinesByDate[today] = syncedRoutine;
  await writeStore(store);
  return syncedRoutine;
}
