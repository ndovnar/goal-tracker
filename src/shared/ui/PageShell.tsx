import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import { useI18n } from "@/shared/lib/i18n";
import { LocaleSwitcher } from "@/shared/ui/LocaleSwitcher";

export function PageShell({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}): JSX.Element {
  const { t } = useI18n();
  return (
    <section
      className={cn(
        "mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-28 pt-6 md:px-6",
        className,
      )}
    >
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <p className="font-display text-sm text-moss-700">
            {t("common.appName")}
          </p>
          <LocaleSwitcher />
        </div>
        <h1 className="font-display text-3xl text-ink">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-sm text-slate-600">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
