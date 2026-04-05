import { Link } from "react-router-dom";

import { useI18n } from "@/shared/lib/i18n";
import { Card } from "@/shared/ui/Card";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import type { DueCheckIn } from "@/shared/types/domain";

export function DueCheckInList({
  items,
}: {
  items: DueCheckIn[];
}): JSX.Element {
  const { t } = useI18n();
  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <Link
          key={item.challengeId}
          to={`/challenge/${item.challengeId}?date=${item.date}`}
        >
          <Card className="flex items-center justify-between gap-4 bg-slate-50/88 transition duration-200 hover:border-slate-300 hover:bg-slate-100/92">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500">
                {t("common.day")} {item.dayNumber}
              </p>
              <h3 className="text-base font-semibold text-ink">
                {item.challengeTitle}
              </h3>
              <p className="text-sm text-slate-600">
                {t("dashboard.completeForToday", {
                  value: item.completionRate,
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge value={item.derivedStatus} />
              <span className="text-sm font-semibold text-slate-400">Open</span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
