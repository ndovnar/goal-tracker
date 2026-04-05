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
        "h-2 w-full overflow-hidden rounded-full bg-slate-100/90",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-ink via-moss-700 to-moss-500 transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
