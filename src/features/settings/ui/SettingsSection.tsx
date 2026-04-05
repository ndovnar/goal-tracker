import type { ReactNode } from "react";

import { Card } from "@/shared/ui/Card";

export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <Card className="space-y-5 bg-slate-50/88">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      {children}
    </Card>
  );
}
