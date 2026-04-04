import { cn } from "@/shared/lib/cn";
import { getStatusTranslationKey, useI18n } from "@/shared/lib/i18n";
import type {
  ChallengeStatus,
  DailyDerivedStatus,
  SyncState,
} from "@/shared/types/domain";

type StatusValue = ChallengeStatus | DailyDerivedStatus | SyncState;

const toneMap: Record<StatusValue, string> = {
  active: "bg-moss-100 text-moss-800",
  archived: "bg-slate-100 text-slate-600",
  completed: "bg-sand-100 text-sand-800",
  complete: "bg-moss-100 text-moss-800",
  partial: "bg-sand-100 text-sand-800",
  failed: "bg-rose-100 text-rose-700",
  upcoming: "bg-slate-100 text-slate-600",
  idle: "bg-slate-100 text-slate-700",
  syncing: "bg-slate-200 text-slate-800",
  success: "bg-moss-100 text-moss-800",
  error: "bg-rose-100 text-rose-700",
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
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize",
        toneMap[value],
        className,
      )}
    >
      {t(getStatusTranslationKey(value))}
    </span>
  );
}
