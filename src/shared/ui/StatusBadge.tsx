import { cn } from "@/shared/lib/cn";
import { getStatusTranslationKey, useI18n } from "@/shared/lib/i18n";
import type {
  ChallengeStatus,
  DailyDerivedStatus,
  SyncState,
} from "@/shared/types/domain";

type StatusValue = ChallengeStatus | DailyDerivedStatus | SyncState;

const toneMap: Record<StatusValue, string> = {
  active: "border border-moss-300 bg-moss-100 text-moss-800",
  archived: "border border-slate-200 bg-slate-100 text-slate-600",
  completed: "border border-sand-300 bg-sand-100 text-sand-800",
  complete: "border border-moss-300 bg-moss-100 text-moss-800",
  partial: "border border-sand-300 bg-sand-100 text-sand-800",
  failed: "border border-rose-700 bg-rose-950/70 text-rose-300",
  upcoming: "border border-slate-200 bg-slate-100 text-slate-600",
  idle: "border border-slate-200 bg-slate-100 text-slate-700",
  syncing: "border border-slate-300 bg-slate-200 text-slate-800",
  success: "border border-moss-300 bg-moss-100 text-moss-800",
  error: "border border-rose-700 bg-rose-950/70 text-rose-300",
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
