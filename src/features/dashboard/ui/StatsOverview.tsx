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
        <Card key={item.label} className="space-y-6 bg-slate-50/88">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <span className="h-2 w-2 rounded-full bg-moss-500" />
          </div>
          <p className="font-display text-4xl text-ink">{item.value}</p>
        </Card>
      ))}
    </div>
  );
}
