import type {
  AppSnapshot,
  Challenge,
  ChecklistItem,
  DailyEntry,
  DeletedRecord,
} from "@/shared/types/domain";

function mergeRecordsByUpdatedAt<T extends { id: string; updatedAt: string }>(
  localRecords: T[],
  remoteRecords: T[],
): T[] {
  const mergedMap = new Map<string, T>();
  [...remoteRecords, ...localRecords].forEach((record) => {
    const existingRecord = mergedMap.get(record.id);
    if (
      !existingRecord ||
      new Date(record.updatedAt).getTime() >=
        new Date(existingRecord.updatedAt).getTime()
    ) {
      mergedMap.set(record.id, record);
    }
  });
  return Array.from(mergedMap.values());
}

function normalizeChallengeRecords(challenges: Challenge[]): Challenge[] {
  return [...challenges].sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt),
  );
}

function normalizeChecklistItemRecords(
  items: ChecklistItem[],
): ChecklistItem[] {
  return [...items].sort((left, right) => {
    if (left.challengeId === right.challengeId) {
      return left.order - right.order;
    }
    return left.challengeId.localeCompare(right.challengeId);
  });
}

function normalizeDailyEntryRecords(entries: DailyEntry[]): DailyEntry[] {
  return [...entries].sort((left, right) => {
    if (left.challengeId === right.challengeId) {
      return left.date.localeCompare(right.date);
    }
    return left.challengeId.localeCompare(right.challengeId);
  });
}

function mergeDeletedRecords(
  localRecords: DeletedRecord[],
  remoteRecords: DeletedRecord[],
): DeletedRecord[] {
  const mergedMap = new Map<string, DeletedRecord>();
  [...remoteRecords, ...localRecords].forEach((record) => {
    const existingRecord = mergedMap.get(record.id);
    if (
      !existingRecord ||
      new Date(record.deletedAt).getTime() >=
        new Date(existingRecord.deletedAt).getTime()
    ) {
      mergedMap.set(record.id, record);
    }
  });
  return Array.from(mergedMap.values()).sort((left, right) =>
    left.deletedAt.localeCompare(right.deletedAt),
  );
}

function filterDeletedRecords<T extends { id: string; updatedAt: string }>(
  records: T[],
  deletedRecords: DeletedRecord[],
): T[] {
  const deletedRecordMap = new Map(
    deletedRecords.map((record) => [record.entityId, record]),
  );
  return records.filter((record) => {
    const deletedRecord = deletedRecordMap.get(record.id);
    if (!deletedRecord) {
      return true;
    }
    return (
      new Date(record.updatedAt).getTime() >
      new Date(deletedRecord.deletedAt).getTime()
    );
  });
}

export function mergeSnapshots(
  localSnapshot: AppSnapshot,
  remoteSnapshot: AppSnapshot | null,
): AppSnapshot {
  if (!remoteSnapshot) {
    return localSnapshot;
  }
  const deletedRecords = mergeDeletedRecords(
    localSnapshot.deletedRecords,
    remoteSnapshot.deletedRecords,
  );
  const challenges = filterDeletedRecords(
    mergeRecordsByUpdatedAt(
      localSnapshot.challenges,
      remoteSnapshot.challenges,
    ),
    deletedRecords,
  );
  const checklistItems = filterDeletedRecords(
    mergeRecordsByUpdatedAt(
      localSnapshot.checklistItems,
      remoteSnapshot.checklistItems,
    ),
    deletedRecords,
  );
  const dailyEntries = filterDeletedRecords(
    mergeRecordsByUpdatedAt(
      localSnapshot.dailyEntries,
      remoteSnapshot.dailyEntries,
    ),
    deletedRecords,
  );
  return {
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    challenges: normalizeChallengeRecords(challenges),
    checklistItems: normalizeChecklistItemRecords(checklistItems),
    dailyEntries: normalizeDailyEntryRecords(dailyEntries),
    deletedRecords,
  };
}
