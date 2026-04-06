import {
  createChallenge,
  deleteChallenge,
  updateChallenge,
} from "@/shared/lib/db/repositories";
import { syncService } from "@/features/sync/api/syncService";
import { useAppStore } from "@/store/useAppStore";
import type { ChallengeFormValues } from "@/shared/types/schemas";

export async function createChallengeWithSideEffects(
  values: ChallengeFormValues,
): Promise<string> {
  const challengeId = await createChallenge(values);
  useAppStore.getState().bumpDataVersion();
  syncService.scheduleSync();
  return challengeId;
}

export async function deleteChallengeWithSideEffects(
  challengeId: string,
): Promise<void> {
  await deleteChallenge(challengeId);
  useAppStore.getState().bumpDataVersion();
  syncService.scheduleSync();
}

export async function updateChallengeWithSideEffects(
  challengeId: string,
  values: ChallengeFormValues,
): Promise<void> {
  await updateChallenge(challengeId, values);
  useAppStore.getState().bumpDataVersion();
  syncService.scheduleSync();
}
