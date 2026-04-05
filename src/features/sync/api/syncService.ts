import { isAfter } from "date-fns";

import { connectGoogle } from "@/features/auth/api/googleIdentity";
import {
  DriveApiError,
  getRemoteSnapshot,
  uploadRemoteSnapshot,
} from "@/features/sync/api/googleDriveClient";
import {
  applySnapshot,
  finalizeSuccessfulSync,
  getAppSnapshot,
  getSyncMetadata,
  markSyncAttempt,
} from "@/shared/lib/db/repositories";
import { mergeSnapshots } from "@/features/sync/api/merge";
import { translateCurrent } from "@/shared/lib/i18n";
import { useAppStore } from "@/store/useAppStore";

function shouldInvalidateAccessToken(error: DriveApiError): boolean {
  if (error.status === 401) {
    return true;
  }
  if (error.status !== 403) {
    return false;
  }
  return [
    "authError",
    "insufficientPermissions",
    "insufficientFilePermissions",
  ].includes(error.reason ?? "");
}

class SyncService {
  private syncTimer: number | null = null;
  private activeSync: Promise<void> | null = null;

  public scheduleSync(): void {
    if (this.syncTimer) {
      window.clearTimeout(this.syncTimer);
    }
    this.syncTimer = window.setTimeout(() => {
      void this.syncNow({ prompt: "", silent: true });
    }, 1200);
  }

  public async syncNow(options: {
    prompt: "" | "consent";
    silent?: boolean;
  }): Promise<void> {
    if (this.activeSync) {
      return this.activeSync;
    }
    this.activeSync = this.runSync(options).finally(() => {
      this.activeSync = null;
    });
    return this.activeSync;
  }

  private async getActiveAccessToken(
    prompt: "" | "consent",
  ): Promise<string | null> {
    const {
      accessToken,
      accessTokenExpiresAt,
      authSession,
      setGoogleConnection,
    } = useAppStore.getState();
    if (
      accessToken &&
      accessTokenExpiresAt &&
      isAfter(new Date(accessTokenExpiresAt), new Date())
    ) {
      return accessToken;
    }
    if (!authSession.connected) {
      return null;
    }
    // Silent/background sync must never open the Google popup outside a user gesture.
    if (prompt !== "consent") {
      return null;
    }
    const nextConnection = await connectGoogle(prompt);
    setGoogleConnection(nextConnection);
    return nextConnection.accessToken;
  }

  private async runSync(options: {
    prompt: "" | "consent";
    silent?: boolean;
  }): Promise<void> {
    const {
      online,
      authSession,
      pushToast,
      bumpDataVersion,
      clearGoogleAccessToken,
    } = useAppStore.getState();
    if (!online || !authSession.connected) {
      return;
    }
    const accessToken = await this.getActiveAccessToken(options.prompt);
    if (!accessToken) {
      if (!options.silent && options.prompt === "consent") {
        pushToast({
          title: translateCurrent("errors.connectGoogleFirst"),
          tone: "error",
        });
      }
      return;
    }
    await markSyncAttempt("syncing");
    try {
      const localSnapshot = await getAppSnapshot();
      const remoteData = await getRemoteSnapshot(accessToken);
      const mergedSnapshot = mergeSnapshots(localSnapshot, remoteData.snapshot);
      await applySnapshot(mergedSnapshot);
      const remoteFileId = await uploadRemoteSnapshot(
        accessToken,
        remoteData.fileId,
        mergedSnapshot,
      );
      await finalizeSuccessfulSync(remoteFileId);
      bumpDataVersion();
      if (!options.silent) {
        pushToast({
          title: translateCurrent("common.syncComplete"),
          tone: "success",
        });
      }
    } catch (error) {
      if (
        error instanceof DriveApiError &&
        shouldInvalidateAccessToken(error)
      ) {
        clearGoogleAccessToken();
      }
      const message =
        error instanceof Error
          ? error.message
          : translateCurrent("errors.syncFailed");
      await markSyncAttempt("error", message);
      if (!options.silent) {
        pushToast({
          title: message,
          tone: "error",
        });
      }
    }
  }

  public async refreshSyncMetadata(): Promise<void> {
    await getSyncMetadata();
  }
}

export const syncService = new SyncService();
