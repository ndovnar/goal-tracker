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
    <Card className="flex flex-col gap-4 bg-white/80">
      <div className="h-12 w-12 rounded-2xl bg-moss-100" />
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      {action}
    </Card>
  );
}
