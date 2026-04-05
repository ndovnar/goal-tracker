import type { ReactNode } from "react";

import { Card } from "@/shared/ui/Card";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}): JSX.Element {
  return (
    <Card className="flex flex-col gap-5 bg-slate-50/88">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-moss-300 bg-moss-100 shadow-soft">
        <div className="h-3 w-3 rounded-full bg-moss-500" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      {action}
    </Card>
  );
}
