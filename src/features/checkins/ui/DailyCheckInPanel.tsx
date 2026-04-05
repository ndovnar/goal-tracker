import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useEffectEvent } from "react";
import { useForm } from "react-hook-form";

import { saveDailyCheckIn } from "@/features/checkins/api/checkinService";
import { formatDisplayDate } from "@/shared/lib/date";
import { useI18n } from "@/shared/lib/i18n";
import { Card } from "@/shared/ui/Card";
import { TextAreaField } from "@/shared/ui/Field";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import {
  getDailyCheckInSchema,
  type DailyCheckInValues,
} from "@/shared/types/schemas";
import type { ChallengeDayState, ChecklistItem } from "@/shared/types/domain";

function getDefaultValues(
  selectedDay: ChallengeDayState | null,
): DailyCheckInValues {
  return {
    checkedItemIds: selectedDay?.entry?.checkedItemIds ?? [],
    note: selectedDay?.entry?.note ?? "",
  };
}

export function DailyCheckInPanel({
  challengeId,
  selectedDay,
  checklistItems,
}: {
  challengeId: string;
  selectedDay: ChallengeDayState | null;
  checklistItems: ChecklistItem[];
}): JSX.Element {
  const { locale, t } = useI18n();
  const { register, watch, reset, formState } = useForm<DailyCheckInValues>({
    resolver: zodResolver(getDailyCheckInSchema(locale)),
    defaultValues: getDefaultValues(selectedDay),
  });
  const values = watch();
  useEffect(() => {
    reset(getDefaultValues(selectedDay));
  }, [reset, selectedDay]);
  const persistCheckIn = useEffectEvent(async () => {
    if (!selectedDay || !selectedDay.isEditable || !formState.isDirty) {
      return;
    }
    await saveDailyCheckIn({
      challengeId,
      date: selectedDay.date,
      checkedItemIds: values.checkedItemIds,
      note: values.note,
    });
    reset(values);
  });
  useEffect(() => {
    if (!selectedDay || !selectedDay.isEditable || !formState.isDirty) {
      return;
    }
    const timeoutId = window.setTimeout(() => {
      void persistCheckIn();
    }, 500);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [formState.isDirty, persistCheckIn, selectedDay, values]);
  if (!selectedDay) {
    return (
      <Card className="bg-slate-50/88">
        <p className="text-sm text-slate-600">{t("checkIn.pickDay")}</p>
      </Card>
    );
  }
  return (
    <Card className="space-y-5 bg-slate-50/88">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500">
            {t("checkIn.title")}
          </p>
          <h3 className="text-xl font-semibold text-ink">
            {formatDisplayDate(selectedDay.date, locale)}
          </h3>
          <p className="text-sm text-slate-600">
            {selectedDay.isEditable
              ? t("common.saveChangesAuto")
              : t("common.futureDaysLocked")}
          </p>
        </div>
        <StatusBadge value={selectedDay.derivedStatus} />
      </div>
      <div className="space-y-3">
        {checklistItems.map((item) => (
          <label
            key={item.id}
            className="flex min-h-14 items-center gap-3 rounded-[28px] border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm font-medium text-ink"
          >
            <input
              type="checkbox"
              value={item.id}
              disabled={!selectedDay.isEditable}
              className="h-5 w-5 rounded border-slate-300 text-moss-600"
              {...register("checkedItemIds")}
            />
            <span className="flex-1">{item.label}</span>
            <span className="text-xs text-slate-500">
              {item.isRequired ? t("common.required") : t("common.optional")}
            </span>
          </label>
        ))}
      </div>
      <TextAreaField
        label={t("checkIn.dailyNote")}
        placeholder={t("checkIn.dailyNotePlaceholder")}
        disabled={!selectedDay.isEditable}
        {...register("note")}
      />
    </Card>
  );
}
