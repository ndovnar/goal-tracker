export type ChallengeStatus = "active" | "completed" | "archived";

export type DailyDerivedStatus = "complete" | "partial" | "failed" | "upcoming";

export type EntrySyncStatus = "local" | "pending" | "synced" | "error";

export type SyncState = "idle" | "syncing" | "success" | "error";

export type AppLocale = "en" | "ru";

export type PendingChangeOperation = "create" | "update" | "delete" | "replace";

export type PendingEntityType =
  | "challenge"
  | "checklistItem"
  | "dailyEntry"
  | "snapshot";

export type DeletedEntityType = Exclude<PendingEntityType, "snapshot">;

export interface Challenge {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  status: ChallengeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  challengeId: string;
  label: string;
  order: number;
  isRequired: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailyEntry {
  id: string;
  challengeId: string;
  date: string;
  checkedItemIds: string[];
  note: string;
  derivedStatus: DailyDerivedStatus;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  syncStatus: EntrySyncStatus;
}

export interface SyncMetadata {
  id: string;
  remoteFileId: string | null;
  lastSyncedAt: string | null;
  lastSyncAttemptAt: string | null;
  syncState: SyncState;
  pendingChangesCount: number;
  lastError: string | null;
}

export interface PendingChange {
  id: string;
  entityType: PendingEntityType;
  entityId: string;
  operation: PendingChangeOperation;
  payload: string;
  createdAt: string;
}

export interface DeletedRecord {
  id: string;
  entityType: DeletedEntityType;
  entityId: string;
  deletedAt: string;
}

export interface ChallengeWithItems {
  challenge: Challenge;
  checklistItems: ChecklistItem[];
}

export interface ChallengeDayState {
  date: string;
  dayNumber: number;
  checkedCount: number;
  requiredCount: number;
  completionRate: number;
  isEditable: boolean;
  entry: DailyEntry | null;
  derivedStatus: DailyDerivedStatus;
}

export interface ChallengeSummary {
  id: string;
  title: string;
  description: string;
  status: ChallengeStatus;
  durationDays: number;
  startDate: string;
  endDate: string;
  currentDay: number;
  completedDays: number;
  failedDays: number;
  completionPercentage: number;
  currentStreak: number;
  longestStreak: number;
  todayStatus: DailyDerivedStatus;
  todayCompletionRate: number;
}

export interface HabitAdherence {
  itemId: string;
  label: string;
  adherencePercentage: number;
  completedDays: number;
  eligibleDays: number;
}

export interface ChallengeDetail {
  challenge: Challenge;
  checklistItems: ChecklistItem[];
  dayStates: ChallengeDayState[];
  selectedDay: ChallengeDayState | null;
  summary: ChallengeSummary;
  habitAdherence: HabitAdherence[];
}

export interface DashboardStats {
  activeChallengesCount: number;
  completedChallengesCount: number;
  totalCompletedDays: number;
  totalFailedDays: number;
  averageCompletionPercentage: number;
  longestCurrentStreak: number;
}

export interface DueCheckIn {
  challengeId: string;
  challengeTitle: string;
  date: string;
  dayNumber: number;
  derivedStatus: DailyDerivedStatus;
  completionRate: number;
}

export interface DashboardData {
  stats: DashboardStats;
  activeChallenges: ChallengeSummary[];
  completedChallenges: ChallengeSummary[];
  dueToday: DueCheckIn[];
}

export interface HistoryEntry {
  challengeId: string;
  challengeTitle: string;
  date: string;
  dayNumber: number;
  derivedStatus: DailyDerivedStatus;
  completionRate: number;
  checkedCount: number;
  requiredCount: number;
}

export interface AuthProfile {
  email: string;
  name: string;
  picture: string;
}

export interface AuthSession {
  profile: AuthProfile | null;
  connected: boolean;
  grantedScopes: string[];
  onboardingCompleted: boolean;
}

export interface AppSnapshot {
  schemaVersion: number;
  exportedAt: string;
  challenges: Challenge[];
  checklistItems: ChecklistItem[];
  dailyEntries: DailyEntry[];
  deletedRecords: DeletedRecord[];
}
