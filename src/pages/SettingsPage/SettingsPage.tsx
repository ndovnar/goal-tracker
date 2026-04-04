import type { ChangeEvent } from "react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  connectGoogle,
  revokeGoogleAccess,
} from "@/features/auth/api/googleIdentity";
import { syncService } from "@/features/sync/api/syncService";
import {
  getAppSnapshot,
  getPendingChanges,
  getSyncMetadata,
  mergeSnapshotIntoLocal,
  resetLocalData,
} from "@/shared/lib/db/repositories";
import { formatLongDateTime } from "@/shared/lib/date";
import { useI18n } from "@/shared/lib/i18n";
import { useAsyncValue } from "@/shared/lib/useAsyncValue";
import { Button } from "@/shared/ui/Button";
import { PageShell } from "@/shared/ui/PageShell";
import { SettingsSection } from "@/features/settings/ui/SettingsSection";
import { LocaleSwitcher } from "@/shared/ui/LocaleSwitcher";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { parseAppSnapshot } from "@/shared/types/schemas";
import { useAppStore } from "@/store/useAppStore";

export function SettingsPage(): JSX.Element {
  const { locale, t } = useI18n();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dataVersion = useAppStore((state) => state.dataVersion);
  const authSession = useAppStore((state) => state.authSession);
  const accessToken = useAppStore((state) => state.accessToken);
  const clearGoogleConnection = useAppStore(
    (state) => state.clearGoogleConnection,
  );
  const setGoogleConnection = useAppStore((state) => state.setGoogleConnection);
  const pushToast = useAppStore((state) => state.pushToast);
  const bumpDataVersion = useAppStore((state) => state.bumpDataVersion);
  const { data, refresh } = useAsyncValue(async () => {
    const [syncMetadata, pendingChanges, snapshot] = await Promise.all([
      getSyncMetadata(),
      getPendingChanges(),
      getAppSnapshot(),
    ]);
    return {
      syncMetadata,
      pendingChanges,
      snapshot,
    };
  }, [dataVersion]);
  async function handleConnectGoogle(): Promise<void> {
    try {
      const connection = await connectGoogle("consent");
      setGoogleConnection(connection);
      await syncService.syncNow({ prompt: "", silent: false });
      await refresh();
    } catch (error) {
      pushToast({
        title:
          error instanceof Error
            ? error.message
            : t("settings.connectGoogleError"),
        tone: "error",
      });
    }
  }
  async function handleDisconnectGoogle(): Promise<void> {
    await revokeGoogleAccess(accessToken);
    clearGoogleConnection();
    pushToast({
      title: t("settings.disconnected"),
      tone: "success",
    });
  }
  async function handleManualSync(): Promise<void> {
    await syncService.syncNow({ prompt: "consent", silent: false });
    await refresh();
  }
  async function handleExportJson(): Promise<void> {
    const snapshot = await getAppSnapshot();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `goal-tracker-export-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  async function handleImportFile(
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const rawText = await file.text();
      const snapshot = parseAppSnapshot(JSON.parse(rawText));
      await mergeSnapshotIntoLocal(snapshot);
      bumpDataVersion();
      syncService.scheduleSync();
      pushToast({
        title: t("settings.importMerged"),
        tone: "success",
      });
      await refresh();
    } catch (error) {
      pushToast({
        title:
          error instanceof Error ? error.message : t("settings.importError"),
        tone: "error",
      });
    } finally {
      event.target.value = "";
    }
  }
  async function handleResetLocalData(): Promise<void> {
    if (!window.confirm(t("settings.resetConfirm"))) {
      return;
    }
    await resetLocalData();
    bumpDataVersion();
    pushToast({
      title: t("settings.resetDone"),
      tone: "success",
    });
    navigate("/");
  }
  return (
    <PageShell
      title={t("settings.title")}
      description={t("settings.description")}
    >
      <SettingsSection
        title={t("settings.languageTitle")}
        description={t("settings.languageDescription")}
      >
        <LocaleSwitcher />
      </SettingsSection>
      <SettingsSection
        title={t("settings.accountTitle")}
        description={t("settings.accountDescription")}
      >
        {authSession.connected && authSession.profile ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-lg font-semibold text-ink">
                {authSession.profile.name}
              </p>
              <p className="text-sm text-slate-600">
                {authSession.profile.email}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => void handleDisconnectGoogle()}
            >
              {t("settings.disconnect")}
            </Button>
          </div>
        ) : (
          <Button onClick={() => void handleConnectGoogle()}>
            {t("settings.connectGoogleDrive")}
          </Button>
        )}
      </SettingsSection>
      <SettingsSection
        title={t("settings.syncTitle")}
        description={t("settings.syncDescription")}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 rounded-3xl bg-slate-50 p-4">
            <p className="text-sm text-slate-600">{t("settings.syncStatus")}</p>
            <StatusBadge value={data?.syncMetadata.syncState ?? "idle"} />
          </div>
          <div className="space-y-2 rounded-3xl bg-slate-50 p-4">
            <p className="text-sm text-slate-600">
              {t("settings.pendingChanges")}
            </p>
            <p className="text-lg font-semibold text-ink">
              {data?.pendingChanges.length ?? 0}
            </p>
          </div>
          <div className="space-y-2 rounded-3xl bg-slate-50 p-4">
            <p className="text-sm text-slate-600">{t("settings.lastSynced")}</p>
            <p className="text-lg font-semibold text-ink">
              {formatLongDateTime(
                data?.syncMetadata.lastSyncedAt ?? null,
                locale,
              )}
            </p>
          </div>
          <div className="space-y-2 rounded-3xl bg-slate-50 p-4">
            <p className="text-sm text-slate-600">{t("settings.lastError")}</p>
            <p className="text-sm font-medium text-ink">
              {data?.syncMetadata.lastError ?? t("settings.noSyncErrors")}
            </p>
          </div>
        </div>
        <Button
          onClick={() => void handleManualSync()}
          disabled={!authSession.connected}
        >
          {t("settings.syncNow")}
        </Button>
      </SettingsSection>
      <SettingsSection
        title={t("settings.dataToolsTitle")}
        description={t("settings.dataToolsDescription")}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Button variant="secondary" onClick={() => void handleExportJson()}>
            {t("settings.exportJson")}
          </Button>
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            {t("settings.importJson")}
          </Button>
          <Button variant="danger" onClick={() => void handleResetLocalData()}>
            {t("settings.resetLocalData")}
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(event) => void handleImportFile(event)}
        />
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            {t("settings.currentSnapshot")}
          </p>
          <p className="mt-2 text-sm text-ink">
            {t("settings.snapshotSummary", {
              challenges: data?.snapshot.challenges.length ?? 0,
              items: data?.snapshot.checklistItems.length ?? 0,
              entries: data?.snapshot.dailyEntries.length ?? 0,
            })}
          </p>
        </div>
      </SettingsSection>
    </PageShell>
  );
}
