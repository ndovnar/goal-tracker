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
        "inline-flex rounded-full border border-slate-200/80 bg-slate-100/84 p-1 shadow-soft backdrop-blur",
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
            "min-w-12 rounded-full px-3 py-2 text-xs font-semibold transition duration-200",
            locale === item
              ? "bg-moss-500 text-slate-900 shadow-soft"
              : "text-slate-500 hover:bg-slate-200 hover:text-ink",
          )}
          onClick={() => setLocale(item)}
        >
          {t(`localeSwitcher.${item}`)}
        </button>
      ))}
    </div>
  );
}
