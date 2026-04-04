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
          <Card className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-moss-700">
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
            <StatusBadge value={item.derivedStatus} />
          </Card>
        </Link>
      ))}
    </div>
  );
}
