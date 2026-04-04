import { cn } from "@/shared/lib/cn";
import { useI18n } from "@/shared/lib/i18n";
import type { ChallengeDayState } from "@/shared/types/domain";

const statusClasses = {
  complete: "bg-moss-500 text-white",
  partial: "bg-sand-400 text-white",
  failed: "bg-rose-400 text-white",
  upcoming: "bg-slate-100 text-slate-500",
};

export function DayGrid({
  days,
  selectedDate,
  onSelect,
}: {
  days: ChallengeDayState[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
}): JSX.Element {
  const { t } = useI18n();
  return (
    <div className="grid grid-cols-5 gap-3 sm:grid-cols-7">
      {days.map((day) => (
        <button
          key={day.date}
          type="button"
          className={cn(
            "flex aspect-square flex-col items-center justify-center rounded-3xl text-sm font-semibold transition",
            statusClasses[day.derivedStatus],
            selectedDate === day.date && "ring-4 ring-ink/10",
          )}
          onClick={() => onSelect(day.date)}
        >
          <span className="text-xs opacity-80">{t("common.day")}</span>
          <span>{day.dayNumber}</span>
        </button>
      ))}
    </div>
  );
}
