import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import { useI18n } from "@/shared/lib/i18n";
import { LocaleSwitcher } from "@/shared/ui/LocaleSwitcher";

export function PageShell({
  title,
  description,
  children,
  className,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}): JSX.Element {
  const { t } = useI18n();
  return (
    <section
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-32 pt-6 md:px-6 md:pt-8",
        className,
      )}
    >
      <header className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="inline-flex items-center gap-3 rounded-full border border-slate-200/80 bg-slate-100/84 px-4 py-2 shadow-soft backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-moss-500" />
            <p className="text-sm font-semibold text-slate-700">
              {t("common.appName")}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            {actions}
            <LocaleSwitcher />
          </div>
        </div>
        <h1 className="font-display text-4xl text-ink md:text-5xl">{title}</h1>
        {description ? (
          <p className="max-w-3xl text-sm text-slate-600 md:text-base">
            {description}
          </p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
