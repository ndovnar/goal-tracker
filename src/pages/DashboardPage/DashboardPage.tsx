import { Link } from "react-router-dom";

import { getDashboardData } from "@/shared/lib/db/repositories";
import { useAsyncValue } from "@/shared/lib/useAsyncValue";
import { LoadingCards } from "@/shared/ui/LoadingCards";
import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Button } from "@/shared/ui/Button";
import { ChallengeCard } from "@/features/challenges/ui/ChallengeCard";
import { DueCheckInList } from "@/features/dashboard/ui/DueCheckInList";
import { StatsOverview } from "@/features/dashboard/ui/StatsOverview";
import { useI18n } from "@/shared/lib/i18n";
import { useAppStore } from "@/store/useAppStore";

export function DashboardPage(): JSX.Element {
  const { t } = useI18n();
  const dataVersion = useAppStore((state) => state.dataVersion);
  const { data, loading } = useAsyncValue(
    () => getDashboardData(),
    [dataVersion],
  );
  return (
    <PageShell
      title={t("dashboard.title")}
      description={t("dashboard.description")}
    >
      {loading || !data ? (
        <LoadingCards count={4} />
      ) : (
        <>
          <StatsOverview stats={data.stats} />
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-ink">
                {t("dashboard.today")}
              </h2>
              <Link
                className="text-sm font-semibold text-moss-700"
                to="/history"
              >
                {t("dashboard.openHistory")}
              </Link>
            </div>
            {data.dueToday.length > 0 ? (
              <DueCheckInList items={data.dueToday} />
            ) : (
              <EmptyState
                title={t("dashboard.nothingDueTitle")}
                description={t("dashboard.nothingDueDescription")}
              />
            )}
          </section>
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-ink">
                {t("dashboard.activeChallenges")}
              </h2>
              <Link
                className="text-sm font-semibold text-moss-700"
                to="/challenge/new"
              >
                {t("dashboard.createNew")}
              </Link>
            </div>
            {data.activeChallenges.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {data.activeChallenges.map((summary) => (
                  <ChallengeCard key={summary.id} summary={summary} />
                ))}
              </div>
            ) : (
              <EmptyState
                title={t("dashboard.noActiveTitle")}
                description={t("dashboard.noActiveDescription")}
                action={
                  <Link to="/challenge/new">
                    <Button>{t("dashboard.createChallenge")}</Button>
                  </Link>
                }
              />
            )}
          </section>
          {data.completedChallenges.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-ink">
                {t("dashboard.completed")}
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {data.completedChallenges.map((summary) => (
                  <ChallengeCard key={summary.id} summary={summary} />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </PageShell>
  );
}
