import { Link } from "react-router-dom";

import { formatShortDate } from "@/shared/lib/date";
import { useI18n } from "@/shared/lib/i18n";
import { Card } from "@/shared/ui/Card";
import { ProgressBar } from "@/shared/ui/ProgressBar";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import type { ChallengeSummary } from "@/shared/types/domain";

export function ChallengeCard({
  summary,
}: {
  summary: ChallengeSummary;
}): JSX.Element {
  const { locale, t } = useI18n();
  return (
    <Link to={`/challenge/${summary.id}`} className="block">
      <Card className="space-y-4 transition hover:-translate-y-1 hover:shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-moss-700">
              {t("challengeDetail.dayProgress", {
                current: Math.max(summary.currentDay, 1),
                duration: summary.durationDays,
              })}
            </p>
            <h3 className="text-lg font-semibold text-ink">{summary.title}</h3>
            <p className="text-sm text-slate-600">
              {formatShortDate(summary.startDate, locale)} -{" "}
              {formatShortDate(summary.endDate, locale)}
            </p>
          </div>
          <StatusBadge value={summary.todayStatus} />
        </div>
        <ProgressBar value={summary.completionPercentage} />
        <div className="grid grid-cols-3 gap-3 text-sm text-slate-600">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs">{t("dashboard.card.completion")}</p>
            <p className="mt-2 text-lg font-semibold text-ink">
              {summary.completionPercentage}%
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs">{t("dashboard.card.currentStreak")}</p>
            <p className="mt-2 text-lg font-semibold text-ink">
              {summary.currentStreak}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs">{t("dashboard.card.failedDays")}</p>
            <p className="mt-2 text-lg font-semibold text-ink">
              {summary.failedDays}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
