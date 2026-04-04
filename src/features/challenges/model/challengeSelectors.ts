import {
  compareDateKeys,
  getCurrentChallengeDayNumber,
  getDateKeysInRange,
  getTodayDateKey,
  isDateEditable,
} from "@/shared/lib/date";
import type {
  Challenge,
  ChallengeDayState,
  ChallengeSummary,
  ChecklistItem,
  DailyDerivedStatus,
  DailyEntry,
  HabitAdherence,
} from "@/shared/types/domain";

export function getResolvedChallengeStatus(
  challenge: Challenge,
): Challenge["status"] {
  if (challenge.status === "archived") {
    return "archived";
  }
  if (compareDateKeys(challenge.endDate, getTodayDateKey()) < 0) {
    return "completed";
  }
  return "active";
}

export function getDayCompletionRate(
  checkedCount: number,
  requiredCount: number,
): number {
  if (requiredCount === 0) {
    return 100;
  }
  return Math.round((checkedCount / requiredCount) * 100);
}

export function getDerivedStatus(
  dateKey: string,
  checkedItemIds: string[],
  checklistItems: ChecklistItem[],
): DailyDerivedStatus {
  const todayKey = getTodayDateKey();
  const requiredItemIds = checklistItems
    .filter((item) => item.isRequired)
    .map((item) => item.id);
  const effectiveRequiredIds =
    requiredItemIds.length > 0
      ? requiredItemIds
      : checklistItems.map((item) => item.id);
  const isComplete = effectiveRequiredIds.every((itemId) =>
    checkedItemIds.includes(itemId),
  );
  if (compareDateKeys(dateKey, todayKey) > 0) {
    return "upcoming";
  }
  if (isComplete) {
    return "complete";
  }
  if (compareDateKeys(dateKey, todayKey) < 0) {
    return "failed";
  }
  return "partial";
}

export function createChallengeDayStates(
  challenge: Challenge,
  checklistItems: ChecklistItem[],
  entries: DailyEntry[],
): ChallengeDayState[] {
  const entryMap = new Map(entries.map((entry) => [entry.date, entry]));
  const requiredCount =
    checklistItems.filter((item) => item.isRequired).length ||
    checklistItems.length;
  return getDateKeysInRange(challenge.startDate, challenge.endDate).map(
    (date, index) => {
      const entry = entryMap.get(date) ?? null;
      const checkedItemIds = entry?.checkedItemIds ?? [];
      const derivedStatus = getDerivedStatus(
        date,
        checkedItemIds,
        checklistItems,
      );
      const checkedCount = checkedItemIds.filter((itemId) =>
        checklistItems.some(
          (checklistItem) =>
            checklistItem.id === itemId && checklistItem.isRequired,
        ),
      ).length;
      return {
        date,
        dayNumber: index + 1,
        checkedCount,
        requiredCount,
        completionRate: getDayCompletionRate(checkedCount, requiredCount),
        isEditable: isDateEditable(date),
        entry,
        derivedStatus,
      };
    },
  );
}

export function getCompletionPercentage(
  dayStates: ChallengeDayState[],
): number {
  if (dayStates.length === 0) {
    return 0;
  }
  const completedCount = dayStates.filter(
    (day) => day.derivedStatus === "complete",
  ).length;
  return Math.round((completedCount / dayStates.length) * 100);
}

export function getFailedDays(dayStates: ChallengeDayState[]): number {
  return dayStates.filter((day) => day.derivedStatus === "failed").length;
}

export function getCompletedDays(dayStates: ChallengeDayState[]): number {
  return dayStates.filter((day) => day.derivedStatus === "complete").length;
}

export function getCurrentStreak(dayStates: ChallengeDayState[]): number {
  const eligibleDays = dayStates.filter(
    (day) => compareDateKeys(day.date, getTodayDateKey()) <= 0,
  );
  let streak = 0;
  for (let index = eligibleDays.length - 1; index >= 0; index -= 1) {
    if (eligibleDays[index]?.derivedStatus !== "complete") {
      break;
    }
    streak += 1;
  }
  return streak;
}

export function getLongestStreak(dayStates: ChallengeDayState[]): number {
  let longestStreak = 0;
  let currentStreak = 0;
  dayStates.forEach((day) => {
    if (day.derivedStatus === "complete") {
      currentStreak += 1;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
      return;
    }
    currentStreak = 0;
  });
  return longestStreak;
}

export function getHabitAdherence(
  checklistItems: ChecklistItem[],
  dayStates: ChallengeDayState[],
): HabitAdherence[] {
  const eligibleDays = dayStates.filter(
    (day) => compareDateKeys(day.date, getTodayDateKey()) <= 0,
  );
  return checklistItems.map((item) => {
    const completedDays = eligibleDays.filter((day) =>
      day.entry?.checkedItemIds.includes(item.id),
    ).length;
    const eligibleCount = eligibleDays.length;
    return {
      itemId: item.id,
      label: item.label,
      completedDays,
      eligibleDays: eligibleCount,
      adherencePercentage:
        eligibleCount === 0
          ? 0
          : Math.round((completedDays / eligibleCount) * 100),
    };
  });
}

export function createChallengeSummary(
  challenge: Challenge,
  checklistItems: ChecklistItem[],
  entries: DailyEntry[],
): ChallengeSummary {
  const dayStates = createChallengeDayStates(
    challenge,
    checklistItems,
    entries,
  );
  const todayState = dayStates.find((day) => day.date === getTodayDateKey());
  return {
    id: challenge.id,
    title: challenge.title,
    description: challenge.description,
    status: getResolvedChallengeStatus(challenge),
    durationDays: challenge.durationDays,
    startDate: challenge.startDate,
    endDate: challenge.endDate,
    currentDay: getCurrentChallengeDayNumber(
      challenge.startDate,
      challenge.endDate,
    ),
    completedDays: getCompletedDays(dayStates),
    failedDays: getFailedDays(dayStates),
    completionPercentage: getCompletionPercentage(dayStates),
    currentStreak: getCurrentStreak(dayStates),
    longestStreak: getLongestStreak(dayStates),
    todayStatus: todayState?.derivedStatus ?? "upcoming",
    todayCompletionRate: todayState?.completionRate ?? 0,
  };
}
