import { Card } from "@/shared/ui/Card";
import { useI18n } from "@/shared/lib/i18n";
import type { DashboardStats } from "@/shared/types/domain";

export function StatsOverview({
  stats,
}: {
  stats: DashboardStats;
}): JSX.Element {
  const { t } = useI18n();
  const items = [
    {
      label: t("dashboard.stats.activeChallenges"),
      value: stats.activeChallengesCount,
    },
    {
      label: t("dashboard.stats.completedChallenges"),
      value: stats.completedChallengesCount,
    },
    {
      label: t("dashboard.stats.completedDays"),
      value: stats.totalCompletedDays,
    },
    { label: t("dashboard.stats.failedDays"), value: stats.totalFailedDays },
    {
      label: t("dashboard.stats.averageCompletion"),
      value: `${stats.averageCompletionPercentage}%`,
    },
    {
      label: t("dashboard.stats.bestCurrentStreak"),
      value: stats.longestCurrentStreak,
    },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <p className="text-sm text-slate-600">{item.label}</p>
          <p className="mt-3 font-display text-4xl text-ink">{item.value}</p>
        </Card>
      ))}
    </div>
  );
}
