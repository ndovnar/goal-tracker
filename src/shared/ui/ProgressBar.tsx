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
        "h-3 w-full overflow-hidden rounded-full bg-slate-100",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-moss-500 to-sand-400 transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
