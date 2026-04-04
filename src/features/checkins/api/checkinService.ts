import { upsertDailyEntry } from "@/shared/lib/db/repositories";
import { syncService } from "@/features/sync/api/syncService";
import { useAppStore } from "@/store/useAppStore";

export async function saveDailyCheckIn(input: {
  challengeId: string;
  date: string;
  checkedItemIds: string[];
  note: string;
}): Promise<void> {
  await upsertDailyEntry(input);
  useAppStore.getState().bumpDataVersion();
  syncService.scheduleSync();
}
