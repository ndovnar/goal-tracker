import { cn } from "@/shared/lib/cn";
import { getStatusTranslationKey, useI18n } from "@/shared/lib/i18n";
import type {
  ChallengeStatus,
  DailyDerivedStatus,
  SyncState,
} from "@/shared/types/domain";

type StatusValue = ChallengeStatus | DailyDerivedStatus | SyncState;

const toneMap: Record<StatusValue, string> = {
  active: "border border-moss-200 bg-moss-50 text-moss-800",
  archived: "border border-slate-200 bg-white text-slate-600",
  completed: "border border-sand-200 bg-sand-50 text-sand-800",
  complete: "border border-moss-200 bg-moss-50 text-moss-800",
  partial: "border border-sand-200 bg-sand-50 text-sand-800",
  failed: "border border-rose-200 bg-rose-50 text-rose-700",
  upcoming: "border border-slate-200 bg-white text-slate-600",
  idle: "border border-slate-200 bg-white text-slate-700",
  syncing: "border border-slate-200 bg-slate-100 text-slate-800",
  success: "border border-moss-200 bg-moss-50 text-moss-800",
  error: "border border-rose-200 bg-rose-50 text-rose-700",
};

export function StatusBadge({
  value,
  className,
}: {
  value: StatusValue;
  className?: string;
}): JSX.Element {
  const { t } = useI18n();
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize",
        toneMap[value],
        className,
      )}
    >
      {t(getStatusTranslationKey(value))}
    </span>
  );
}
