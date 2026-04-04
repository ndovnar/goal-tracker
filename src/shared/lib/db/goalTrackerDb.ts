import Dexie, { type Table } from "dexie";

import type {
  Challenge,
  ChecklistItem,
  DailyEntry,
  DeletedRecord,
  PendingChange,
  SyncMetadata,
} from "@/shared/types/domain";

export class GoalTrackerDatabase extends Dexie {
  challenges!: Table<Challenge, string>;
  checklistItems!: Table<ChecklistItem, string>;
  dailyEntries!: Table<DailyEntry, string>;
  deletedRecords!: Table<DeletedRecord, string>;
  syncMetadata!: Table<SyncMetadata, string>;
  pendingChanges!: Table<PendingChange, string>;

  public constructor() {
    super("goal-tracker-challenge");
    this.version(1).stores({
      challenges: "id, status, startDate, endDate, updatedAt",
      checklistItems: "id, challengeId, [challengeId+order], updatedAt",
      dailyEntries:
        "id, challengeId, date, [challengeId+date], derivedStatus, updatedAt, syncStatus",
      syncMetadata: "id",
      pendingChanges: "id, entityType, entityId, createdAt",
    });
    this.version(2).stores({
      challenges: "id, status, startDate, endDate, updatedAt",
      checklistItems: "id, challengeId, [challengeId+order], updatedAt",
      dailyEntries:
        "id, challengeId, date, [challengeId+date], derivedStatus, updatedAt, syncStatus",
      deletedRecords: "id, entityType, entityId, deletedAt",
      syncMetadata: "id",
      pendingChanges: "id, entityType, entityId, createdAt",
    });
  }
}

export const db = new GoalTrackerDatabase();
