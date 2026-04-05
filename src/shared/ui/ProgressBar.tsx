import { cn } from "@/shared/lib/cn";

interface ProgressBarProps {
  value: number;
  className?: string;
}

export function ProgressBar({
  value,
  className,
}: ProgressBarProps): JSX.Element {
  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-slate-200/90",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-moss-700 via-moss-500 to-moss-400 transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
