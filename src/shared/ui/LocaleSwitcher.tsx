import { cn } from "@/shared/lib/cn";
import { useI18n } from "@/shared/lib/i18n";
import type { AppLocale } from "@/shared/types/domain";

const locales: AppLocale[] = ["en", "ru"];

export function LocaleSwitcher({
  className,
}: {
  className?: string;
}): JSX.Element {
  const { locale, setLocale, t } = useI18n();
  return (
    <div
      className={cn(
        "inline-flex rounded-2xl border border-white/70 bg-white/90 p-1 shadow-soft",
        className,
      )}
      aria-label={t("common.language")}
      role="group"
    >
      {locales.map((item) => (
        <button
          key={item}
          type="button"
          className={cn(
            "min-w-12 rounded-xl px-3 py-2 text-xs font-semibold transition",
            locale === item
              ? "bg-moss-100 text-moss-800"
              : "text-slate-500 hover:bg-slate-50",
          )}
          onClick={() => setLocale(item)}
        >
          {t(`localeSwitcher.${item}`)}
        </button>
      ))}
    </div>
  );
}
