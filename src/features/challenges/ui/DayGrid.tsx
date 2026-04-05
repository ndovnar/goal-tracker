import { cn } from "@/shared/lib/cn";
import { useI18n } from "@/shared/lib/i18n";
import type { ChallengeDayState } from "@/shared/types/domain";

const statusClasses = {
  complete: "border border-moss-200 bg-moss-50 text-moss-900",
  partial: "border border-sand-200 bg-sand-50 text-sand-900",
  failed: "border border-rose-200 bg-rose-50 text-rose-700",
  upcoming: "border border-slate-200 bg-white/72 text-slate-500",
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
            "flex aspect-square flex-col items-center justify-center rounded-[28px] text-sm font-semibold transition duration-200 hover:border-slate-300 hover:bg-white",
            statusClasses[day.derivedStatus],
            selectedDate === day.date && "border-ink ring-4 ring-ink/5",
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
