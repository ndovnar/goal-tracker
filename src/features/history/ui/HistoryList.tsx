import { Card } from "@/shared/ui/Card";
import { useI18n } from "@/shared/lib/i18n";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import type { HistoryEntry } from "@/shared/types/domain";

export function HistoryList({
  entries,
}: {
  entries: HistoryEntry[];
}): JSX.Element {
  const { t } = useI18n();
  return (
    <div className="grid gap-4">
      {entries.map((entry) => (
        <Card
          key={`${entry.challengeId}-${entry.date}`}
          className="flex items-center justify-between gap-4 bg-white/68"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">
              {t("common.day")} {entry.dayNumber} · {entry.date}
            </p>
            <h3 className="text-base font-semibold text-ink">
              {entry.challengeTitle}
            </h3>
            <p className="text-sm text-slate-600">
              {t("history.requiredHabitsCompleted", {
                checked: entry.checkedCount,
                required: entry.requiredCount,
              })}
            </p>
          </div>
          <div className="space-y-2 text-right">
            <StatusBadge value={entry.derivedStatus} />
            <p className="text-sm font-semibold text-ink">
              {entry.completionRate}%
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
