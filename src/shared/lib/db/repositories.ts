import {
  createChallengeDayStates,
  createChallengeSummary,
  getDerivedStatus,
  getHabitAdherence,
} from "@/features/challenges/model/challengeSelectors";
import { mergeSnapshots } from "@/features/sync/api/merge";
import {
  getChallengeEndDate,
  getNowIso,
  getTodayDateKey,
  isDateWithinRange,
} from "@/shared/lib/date";
import { createId } from "@/shared/lib/ids";
import { translateCurrent } from "@/shared/lib/i18n";
import { db } from "@/shared/lib/db/goalTrackerDb";
import type {
  AppSnapshot,
  Challenge,
  ChallengeDetail,
  ChallengeSummary,
  ChecklistItem,
  DashboardData,
  DailyEntry,
  DeletedEntityType,
  DeletedRecord,
  DueCheckIn,
  HistoryEntry,
  PendingChange,
  SyncMetadata,
} from "@/shared/types/domain";
import type { ChallengeFormValues } from "@/shared/types/schemas";

const SYNC_METADATA_ID = "sync";

const DEFAULT_SYNC_METADATA: SyncMetadata = {
  id: SYNC_METADATA_ID,
  remoteFileId: null,
  lastSyncedAt: null,
  lastSyncAttemptAt: null,
  syncState: "idle",
  pendingChangesCount: 0,
  lastError: null,
};

interface DailyEntryInput {
  challengeId: string;
  date: string;
  checkedItemIds: string[];
  note: string;
}

async function refreshPendingChangesCount(): Promise<void> {
  const pendingChangesCount = await db.pendingChanges.count();
  await db.syncMetadata.put({
    ...(await getSyncMetadata()),
    pendingChangesCount,
  });
}

function serializePayload(payload: object): string {
  return JSON.stringify(payload);
}

function createDeletedRecordId(
  entityType: DeletedEntityType,
  entityId: string,
): string {
  return `${entityType}:${entityId}`;
}

function createDeletedRecord(
  entityType: DeletedEntityType,
  entityId: string,
  deletedAt: string,
): DeletedRecord {
  return {
    id: createDeletedRecordId(entityType, entityId),
    entityType,
    entityId,
    deletedAt,
  };
}

function getEffectiveRequiredItemIds(
  checklistItems: ChecklistItem[],
): string[] {
  const requiredItemIds = checklistItems
    .filter((item) => item.isRequired)
    .map((item) => item.id);
  return requiredItemIds.length > 0
    ? requiredItemIds
    : checklistItems.map((item) => item.id);
}

function hasSameStringItems(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }
  const leftSet = new Set(left);
  return right.every((item) => leftSet.has(item));
}

async function createPendingChange(
  change: Omit<PendingChange, "id" | "createdAt">,
): Promise<void> {
  await db.pendingChanges.add({
    id: createId("pending"),
    createdAt: getNowIso(),
    ...change,
  });
  await refreshPendingChangesCount();
}

export async function initializeDatabase(): Promise<void> {
  await db.open();
  const syncMetadata = await db.syncMetadata.get(SYNC_METADATA_ID);
  if (!syncMetadata) {
    await db.syncMetadata.put(DEFAULT_SYNC_METADATA);
  }
}

export async function getSyncMetadata(): Promise<SyncMetadata> {
  return (await db.syncMetadata.get(SYNC_METADATA_ID)) ?? DEFAULT_SYNC_METADATA;
}

export async function updateSyncMetadata(
  patch: Partial<SyncMetadata>,
): Promise<SyncMetadata> {
  const nextValue = {
    ...(await getSyncMetadata()),
    ...patch,
  };
  await db.syncMetadata.put(nextValue);
  return nextValue;
}

export async function getChallenges(): Promise<Challenge[]> {
  return db.challenges
    .toCollection()
    .sortBy("createdAt")
    .then((records) => records.reverse());
}

export async function getChallengeWithItems(challengeId: string): Promise<{
  challenge: Challenge;
  checklistItems: ChecklistItem[];
}> {
  const challenge = await db.challenges.get(challengeId);
  if (!challenge) {
    throw new Error(translateCurrent("errors.challengeNotFound"));
  }
  const checklistItems = await db.checklistItems
    .where("challengeId")
    .equals(challengeId)
    .sortBy("order");
  return {
    challenge,
    checklistItems,
  };
}

export async function getChallengeEntries(
  challengeId: string,
): Promise<DailyEntry[]> {
  return db.dailyEntries
    .where("challengeId")
    .equals(challengeId)
    .sortBy("date");
}

async function buildChallengeSummary(
  challenge: Challenge,
  checklistItems: ChecklistItem[],
  entries: DailyEntry[],
): Promise<ChallengeSummary> {
  return createChallengeSummary(challenge, checklistItems, entries);
}

export async function createChallenge(
  values: ChallengeFormValues,
): Promise<string> {
  const now = getNowIso();
  const challengeId = createId("challenge");
  const challenge: Challenge = {
    id: challengeId,
    title: values.title.trim(),
    description: values.description?.trim() ?? "",
    durationDays: values.durationDays,
    startDate: values.startDate,
    endDate: getChallengeEndDate(values.startDate, values.durationDays),
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
  const checklistItems: ChecklistItem[] = values.checklistItems.map(
    (item: ChallengeFormValues["checklistItems"][number], index: number) => ({
      id: createId("item"),
      challengeId,
      label: item.label.trim(),
      order: index,
      isRequired: item.isRequired,
      archived: false,
      createdAt: now,
      updatedAt: now,
    }),
  );
  await db.transaction(
    "rw",
    db.challenges,
    db.checklistItems,
    db.pendingChanges,
    db.syncMetadata,
    async () => {
      await db.challenges.add(challenge);
      await db.checklistItems.bulkAdd(checklistItems);
      await createPendingChange({
        entityType: "challenge",
        entityId: challengeId,
        operation: "create",
        payload: serializePayload(challenge),
      });
      for (const checklistItem of checklistItems) {
        await createPendingChange({
          entityType: "checklistItem",
          entityId: checklistItem.id,
          operation: "create",
          payload: serializePayload(checklistItem),
        });
      }
    },
  );
  return challengeId;
}

export async function updateChallenge(
  challengeId: string,
  values: ChallengeFormValues,
): Promise<void> {
  const challenge = await db.challenges.get(challengeId);
  if (!challenge) {
    throw new Error(translateCurrent("errors.challengeNotFound"));
  }
  const [existingChecklistItems, existingDailyEntries] = await Promise.all([
    db.checklistItems.where("challengeId").equals(challengeId).sortBy("order"),
    db.dailyEntries.where("challengeId").equals(challengeId).toArray(),
  ]);
  const now = getNowIso();
  const nextChallenge: Challenge = {
    ...challenge,
    title: values.title.trim(),
    description: values.description?.trim() ?? "",
    durationDays: values.durationDays,
    startDate: values.startDate,
    endDate: getChallengeEndDate(values.startDate, values.durationDays),
    updatedAt: now,
  };
  const existingChecklistById = new Map(
    existingChecklistItems.map((item) => [item.id, item]),
  );
  const nextChecklistItems: ChecklistItem[] = values.checklistItems.map(
    (item, index) => {
      const existingItem = existingChecklistById.get(item.id);
      if (existingItem) {
        return {
          ...existingItem,
          label: item.label.trim(),
          order: index,
          isRequired: item.isRequired,
          archived: false,
          updatedAt: now,
        };
      }
      return {
        id: createId("item"),
        challengeId,
        label: item.label.trim(),
        order: index,
        isRequired: item.isRequired,
        archived: false,
        createdAt: now,
        updatedAt: now,
      };
    },
  );
  const nextChecklistIds = new Set(nextChecklistItems.map((item) => item.id));
  const removedChecklistItems = existingChecklistItems.filter(
    (item) => !nextChecklistIds.has(item.id),
  );
  const checklistStructureChanged =
    nextChecklistItems.length !== existingChecklistItems.length ||
    nextChecklistItems.some((item) => !existingChecklistById.has(item.id)) ||
    existingChecklistItems.some(
      (item) =>
        !nextChecklistIds.has(item.id) ||
        nextChecklistItems.find((candidate) => candidate.id === item.id)
          ?.isRequired !== item.isRequired,
    );
  const entriesInsideRange = existingDailyEntries.filter((entry) =>
    isDateWithinRange(
      entry.date,
      nextChallenge.startDate,
      nextChallenge.endDate,
    ),
  );
  const entriesOutsideRange = existingDailyEntries.filter(
    (entry) =>
      !isDateWithinRange(
        entry.date,
        nextChallenge.startDate,
        nextChallenge.endDate,
      ),
  );
  const entriesToUpdate: DailyEntry[] = [];
  if (checklistStructureChanged || removedChecklistItems.length > 0) {
    const effectiveRequiredItemIds =
      getEffectiveRequiredItemIds(nextChecklistItems);
    for (const entry of entriesInsideRange) {
      const nextCheckedItemIds = entry.checkedItemIds.filter((itemId) =>
        nextChecklistIds.has(itemId),
      );
      const nextCompleted = effectiveRequiredItemIds.every((itemId) =>
        nextCheckedItemIds.includes(itemId),
      );
      const nextDerivedStatus = getDerivedStatus(
        entry.date,
        nextCheckedItemIds,
        nextChecklistItems,
      );
      if (
        hasSameStringItems(nextCheckedItemIds, entry.checkedItemIds) &&
        nextCompleted === entry.completed &&
        nextDerivedStatus === entry.derivedStatus
      ) {
        continue;
      }
      entriesToUpdate.push({
        ...entry,
        checkedItemIds: nextCheckedItemIds,
        completed: nextCompleted,
        derivedStatus: nextDerivedStatus,
        updatedAt: now,
        syncStatus: "pending",
      });
    }
  }
  const deletedRecords: DeletedRecord[] = [
    ...removedChecklistItems.map((item) =>
      createDeletedRecord("checklistItem", item.id, now),
    ),
    ...entriesOutsideRange.map((entry) =>
      createDeletedRecord("dailyEntry", entry.id, now),
    ),
  ];
  await db.transaction(
    "rw",
    [
      db.challenges,
      db.checklistItems,
      db.dailyEntries,
      db.deletedRecords,
      db.pendingChanges,
      db.syncMetadata,
    ],
    async () => {
      await db.challenges.put(nextChallenge);
      await db.checklistItems.bulkPut(nextChecklistItems);
      if (removedChecklistItems.length > 0) {
        await db.checklistItems.bulkDelete(
          removedChecklistItems.map((item) => item.id),
        );
      }
      if (entriesToUpdate.length > 0) {
        await db.dailyEntries.bulkPut(entriesToUpdate);
      }
      if (entriesOutsideRange.length > 0) {
        await db.dailyEntries.bulkDelete(
          entriesOutsideRange.map((entry) => entry.id),
        );
      }
      if (deletedRecords.length > 0) {
        await db.deletedRecords.bulkPut(deletedRecords);
      }
      await createPendingChange({
        entityType: "challenge",
        entityId: challengeId,
        operation: "update",
        payload: serializePayload(nextChallenge),
      });
      for (const checklistItem of nextChecklistItems) {
        await createPendingChange({
          entityType: "checklistItem",
          entityId: checklistItem.id,
          operation: existingChecklistById.has(checklistItem.id)
            ? "update"
            : "create",
          payload: serializePayload(checklistItem),
        });
      }
      for (const checklistItem of removedChecklistItems) {
        await createPendingChange({
          entityType: "checklistItem",
          entityId: checklistItem.id,
          operation: "delete",
          payload: serializePayload({
            checklistItemId: checklistItem.id,
            challengeId,
            deletedAt: now,
          }),
        });
      }
      for (const entry of entriesToUpdate) {
        await createPendingChange({
          entityType: "dailyEntry",
          entityId: entry.id,
          operation: "update",
          payload: serializePayload(entry),
        });
      }
      for (const entry of entriesOutsideRange) {
        await createPendingChange({
          entityType: "dailyEntry",
          entityId: entry.id,
          operation: "delete",
          payload: serializePayload({
            dailyEntryId: entry.id,
            challengeId,
            deletedAt: now,
          }),
        });
      }
    },
  );
}

export async function upsertDailyEntry(
  input: DailyEntryInput,
): Promise<DailyEntry> {
  const { challenge, checklistItems } = await getChallengeWithItems(
    input.challengeId,
  );
  const now = getNowIso();
  const existingEntry =
    (await db.dailyEntries
      .where("[challengeId+date]")
      .equals([challenge.id, input.date])
      .first()) ?? null;
  const requiredItems = checklistItems.filter((item) => item.isRequired);
  const effectiveRequiredItems =
    requiredItems.length > 0 ? requiredItems : checklistItems;
  const completed = effectiveRequiredItems.every((item) =>
    input.checkedItemIds.includes(item.id),
  );
  const derivedStatus =
    createChallengeDayStates(challenge, checklistItems, [
      ...(existingEntry ? [] : []),
      {
        id: existingEntry?.id ?? createId("entry"),
        challengeId: input.challengeId,
        date: input.date,
        checkedItemIds: input.checkedItemIds,
        note: input.note,
        completed,
        derivedStatus: completed
          ? "complete"
          : input.date < getTodayDateKey()
            ? "failed"
            : input.date > getTodayDateKey()
              ? "upcoming"
              : "partial",
        createdAt: existingEntry?.createdAt ?? now,
        updatedAt: now,
        syncStatus: "pending",
      },
    ]).find((day) => day.date === input.date)?.derivedStatus ?? "partial";
  const nextEntry: DailyEntry = {
    id: existingEntry?.id ?? createId("entry"),
    challengeId: input.challengeId,
    date: input.date,
    checkedItemIds: input.checkedItemIds,
    note: input.note,
    completed,
    derivedStatus,
    createdAt: existingEntry?.createdAt ?? now,
    updatedAt: now,
    syncStatus: "pending",
  };
  await db.transaction(
    "rw",
    db.dailyEntries,
    db.pendingChanges,
    db.syncMetadata,
    async () => {
      await db.dailyEntries.put(nextEntry);
      await createPendingChange({
        entityType: "dailyEntry",
        entityId: nextEntry.id,
        operation: existingEntry ? "update" : "create",
        payload: serializePayload(nextEntry),
      });
    },
  );
  return nextEntry;
}

export async function getChallengeDetail(
  challengeId: string,
  selectedDate?: string | null,
): Promise<ChallengeDetail> {
  const { challenge, checklistItems } =
    await getChallengeWithItems(challengeId);
  const entries = await getChallengeEntries(challengeId);
  const dayStates = createChallengeDayStates(
    challenge,
    checklistItems,
    entries,
  );
  const selectedDay =
    dayStates.find((day) => day.date === (selectedDate ?? getTodayDateKey())) ??
    dayStates.find((day) => day.date === getTodayDateKey()) ??
    dayStates[0] ??
    null;
  return {
    challenge,
    checklistItems,
    dayStates,
    selectedDay,
    summary: await buildChallengeSummary(challenge, checklistItems, entries),
    habitAdherence: getHabitAdherence(checklistItems, dayStates),
  };
}

function buildDueCheckIns(summary: ChallengeSummary): DueCheckIn | null {
  if (
    summary.status !== "active" ||
    summary.todayStatus === "complete" ||
    summary.currentDay === 0
  ) {
    return null;
  }
  return {
    challengeId: summary.id,
    challengeTitle: summary.title,
    date: getTodayDateKey(),
    dayNumber: summary.currentDay,
    derivedStatus: summary.todayStatus,
    completionRate: summary.todayCompletionRate,
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const challenges = await getChallenges();
  const checklistItems = await db.checklistItems.toArray();
  const dailyEntries = await db.dailyEntries.toArray();
  const summaries = challenges.map((challenge) => {
    const items = checklistItems.filter(
      (item) => item.challengeId === challenge.id,
    );
    const entries = dailyEntries.filter(
      (entry) => entry.challengeId === challenge.id,
    );
    return createChallengeSummary(challenge, items, entries);
  });
  const activeChallenges = summaries.filter(
    (summary) => summary.status === "active",
  );
  const completedChallenges = summaries.filter(
    (summary) => summary.status === "completed",
  );
  const dueToday = activeChallenges
    .map(buildDueCheckIns)
    .filter((item): item is DueCheckIn => Boolean(item));
  const totalCompletedDays = summaries.reduce(
    (total, summary) => total + summary.completedDays,
    0,
  );
  const totalFailedDays = summaries.reduce(
    (total, summary) => total + summary.failedDays,
    0,
  );
  const averageCompletionPercentage =
    summaries.length === 0
      ? 0
      : Math.round(
          summaries.reduce(
            (total, summary) => total + summary.completionPercentage,
            0,
          ) / summaries.length,
        );
  return {
    stats: {
      activeChallengesCount: activeChallenges.length,
      completedChallengesCount: completedChallenges.length,
      totalCompletedDays,
      totalFailedDays,
      averageCompletionPercentage,
      longestCurrentStreak: summaries.reduce(
        (longest, summary) => Math.max(longest, summary.currentStreak),
        0,
      ),
    },
    activeChallenges,
    completedChallenges,
    dueToday,
  };
}

export async function getHistoryEntries(filters: {
  challengeId?: string;
  statuses?: Array<HistoryEntry["derivedStatus"]>;
}): Promise<HistoryEntry[]> {
  const challenges = await getChallenges();
  const checklistItems = await db.checklistItems.toArray();
  const dailyEntries = await db.dailyEntries.toArray();
  const historyEntries = challenges.flatMap((challenge) => {
    if (filters.challengeId && challenge.id !== filters.challengeId) {
      return [];
    }
    const items = checklistItems.filter(
      (item) => item.challengeId === challenge.id,
    );
    const entries = dailyEntries.filter(
      (entry) => entry.challengeId === challenge.id,
    );
    return createChallengeDayStates(challenge, items, entries)
      .filter((dayState) => dayState.date <= getTodayDateKey())
      .map((dayState) => ({
        challengeId: challenge.id,
        challengeTitle: challenge.title,
        date: dayState.date,
        dayNumber: dayState.dayNumber,
        derivedStatus: dayState.derivedStatus,
        completionRate: dayState.completionRate,
        checkedCount: dayState.checkedCount,
        requiredCount: dayState.requiredCount,
      }));
  });
  return historyEntries
    .filter((entry) =>
      filters.statuses?.length
        ? filters.statuses.includes(entry.derivedStatus)
        : true,
    )
    .sort((left, right) => right.date.localeCompare(left.date));
}

export async function getAppSnapshot(): Promise<AppSnapshot> {
  return {
    schemaVersion: 2,
    exportedAt: getNowIso(),
    challenges: await db.challenges.toArray(),
    checklistItems: await db.checklistItems.toArray(),
    dailyEntries: await db.dailyEntries.toArray(),
    deletedRecords: await db.deletedRecords.toArray(),
  };
}

export async function applySnapshot(snapshot: AppSnapshot): Promise<void> {
  await db.transaction(
    "rw",
    db.challenges,
    db.checklistItems,
    db.dailyEntries,
    db.deletedRecords,
    async () => {
      await db.challenges.clear();
      await db.checklistItems.clear();
      await db.dailyEntries.clear();
      await db.deletedRecords.clear();
      if (snapshot.challenges.length > 0) {
        await db.challenges.bulkPut(snapshot.challenges);
      }
      if (snapshot.checklistItems.length > 0) {
        await db.checklistItems.bulkPut(snapshot.checklistItems);
      }
      if (snapshot.dailyEntries.length > 0) {
        await db.dailyEntries.bulkPut(snapshot.dailyEntries);
      }
      if (snapshot.deletedRecords.length > 0) {
        await db.deletedRecords.bulkPut(snapshot.deletedRecords);
      }
    },
  );
}

export async function mergeSnapshotIntoLocal(
  snapshot: AppSnapshot,
): Promise<AppSnapshot> {
  const localSnapshot = await getAppSnapshot();
  const mergedSnapshot = mergeSnapshots(localSnapshot, snapshot);
  await applySnapshot(mergedSnapshot);
  await createPendingChange({
    entityType: "snapshot",
    entityId: "local",
    operation: "replace",
    payload: serializePayload(mergedSnapshot),
  });
  return mergedSnapshot;
}

export async function finalizeSuccessfulSync(
  remoteFileId: string,
): Promise<void> {
  await db.transaction(
    "rw",
    db.pendingChanges,
    db.dailyEntries,
    db.syncMetadata,
    async () => {
      await db.pendingChanges.clear();
      await db.dailyEntries.toCollection().modify((entry) => {
        entry.syncStatus = "synced";
      });
      await db.syncMetadata.put({
        ...(await getSyncMetadata()),
        remoteFileId,
        lastSyncedAt: getNowIso(),
        lastSyncAttemptAt: getNowIso(),
        syncState: "success",
        pendingChangesCount: 0,
        lastError: null,
      });
    },
  );
}

export async function markSyncAttempt(
  state: SyncMetadata["syncState"],
  errorMessage?: string,
): Promise<void> {
  await updateSyncMetadata({
    lastSyncAttemptAt: getNowIso(),
    syncState: state,
    lastError: errorMessage ?? null,
  });
}

export async function getPendingChanges(): Promise<PendingChange[]> {
  return db.pendingChanges.orderBy("createdAt").toArray();
}

export async function deleteChallenge(challengeId: string): Promise<void> {
  const challenge = await db.challenges.get(challengeId);
  if (!challenge) {
    throw new Error(translateCurrent("errors.challengeNotFound"));
  }
  const [checklistItems, dailyEntries] = await Promise.all([
    db.checklistItems.where("challengeId").equals(challengeId).toArray(),
    db.dailyEntries.where("challengeId").equals(challengeId).toArray(),
  ]);
  const now = getNowIso();
  const deletedRecords = [
    createDeletedRecord("challenge", challengeId, now),
    ...checklistItems.map((item) =>
      createDeletedRecord("checklistItem", item.id, now),
    ),
    ...dailyEntries.map((entry) =>
      createDeletedRecord("dailyEntry", entry.id, now),
    ),
  ];
  const entityKeys = new Set(
    deletedRecords.map((record) => `${record.entityType}:${record.entityId}`),
  );
  await db.transaction(
    "rw",
    [
      db.challenges,
      db.checklistItems,
      db.dailyEntries,
      db.deletedRecords,
      db.pendingChanges,
      db.syncMetadata,
    ],
    async () => {
      await db.pendingChanges
        .filter((change) =>
          entityKeys.has(`${change.entityType}:${change.entityId}`),
        )
        .delete();
      await db.challenges.delete(challengeId);
      if (checklistItems.length > 0) {
        await db.checklistItems.bulkDelete(
          checklistItems.map((item) => item.id),
        );
      }
      if (dailyEntries.length > 0) {
        await db.dailyEntries.bulkDelete(dailyEntries.map((entry) => entry.id));
      }
      await db.deletedRecords.bulkPut(deletedRecords);
      await createPendingChange({
        entityType: "challenge",
        entityId: challengeId,
        operation: "delete",
        payload: serializePayload({
          challengeId,
          checklistItemIds: checklistItems.map((item) => item.id),
          dailyEntryIds: dailyEntries.map((entry) => entry.id),
          deletedAt: now,
        }),
      });
    },
  );
}

export async function resetLocalData(): Promise<void> {
  await db.transaction(
    "rw",
    [
      db.challenges,
      db.checklistItems,
      db.dailyEntries,
      db.deletedRecords,
      db.pendingChanges,
      db.syncMetadata,
    ],
    async () => {
      await db.challenges.clear();
      await db.checklistItems.clear();
      await db.dailyEntries.clear();
      await db.deletedRecords.clear();
      await db.pendingChanges.clear();
      await db.syncMetadata.put(DEFAULT_SYNC_METADATA);
    },
  );
}
