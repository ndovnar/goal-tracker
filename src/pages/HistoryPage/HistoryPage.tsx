import { useDeferredValue, useState } from "react";

import { GoogleLoginButton } from "@/features/auth/ui/GoogleLoginButton";
import { getChallenges, getHistoryEntries } from "@/shared/lib/db/repositories";
import { useI18n } from "@/shared/lib/i18n";
import { useAsyncValue } from "@/shared/lib/useAsyncValue";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingCards } from "@/shared/ui/LoadingCards";
import { PageShell } from "@/shared/ui/PageShell";
import { HistoryList } from "@/features/history/ui/HistoryList";
import { useAppStore } from "@/store/useAppStore";
import type { DailyDerivedStatus } from "@/shared/types/domain";

const statusFilters: DailyDerivedStatus[] = ["complete", "partial", "failed"];

export function HistoryPage(): JSX.Element {
  const { t } = useI18n();
  const dataVersion = useAppStore((state) => state.dataVersion);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>("all");
  const [selectedStatuses, setSelectedStatuses] = useState<
    DailyDerivedStatus[]
  >([]);
  const deferredStatuses = useDeferredValue(selectedStatuses);
  const { data, loading } = useAsyncValue(async () => {
    const [challenges, entries] = await Promise.all([
      getChallenges(),
      getHistoryEntries({
        challengeId:
          selectedChallengeId === "all" ? undefined : selectedChallengeId,
        statuses: deferredStatuses.length ? deferredStatuses : undefined,
      }),
    ]);
    return {
      challenges,
      entries,
    };
  }, [dataVersion, selectedChallengeId, deferredStatuses.join(",")]);
  function toggleStatus(status: DailyDerivedStatus): void {
    setSelectedStatuses((currentStatuses) =>
      currentStatuses.includes(status)
        ? currentStatuses.filter((currentStatus) => currentStatus !== status)
        : [...currentStatuses, status],
    );
  }
  return (
    <PageShell
      actions={<GoogleLoginButton />}
      title={t("history.title")}
      description={t("history.description")}
    >
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-4 bg-slate-50/88">
          <p className="text-sm font-semibold text-ink">
            {t("history.challengeFilter")}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedChallengeId === "all" ? "primary" : "secondary"}
              onClick={() => setSelectedChallengeId("all")}
            >
              {t("common.allChallenges")}
            </Button>
            {data?.challenges.map((challenge) => (
              <Button
                key={challenge.id}
                variant={
                  selectedChallengeId === challenge.id ? "primary" : "secondary"
                }
                onClick={() => setSelectedChallengeId(challenge.id)}
              >
                {challenge.title}
              </Button>
            ))}
          </div>
        </Card>
        <Card className="space-y-4 bg-slate-50/88">
          <p className="text-sm font-semibold text-ink">
            {t("history.statusFilter")}
          </p>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((status) => (
              <Button
                key={status}
                variant={
                  selectedStatuses.includes(status) ? "primary" : "secondary"
                }
                onClick={() => toggleStatus(status)}
              >
                {t(`statuses.${status}`)}
              </Button>
            ))}
          </div>
        </Card>
      </section>
      {loading || !data ? (
        <LoadingCards count={4} />
      ) : data.entries.length > 0 ? (
        <HistoryList entries={data.entries} />
      ) : (
        <EmptyState
          title={t("history.noEntriesTitle")}
          description={t("history.noEntriesDescription")}
        />
      )}
    </PageShell>
  );
}
