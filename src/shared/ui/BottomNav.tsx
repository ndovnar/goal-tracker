import { NavLink } from "react-router-dom";

import { cn } from "@/shared/lib/cn";
import { useI18n } from "@/shared/lib/i18n";

export function BottomNav(): JSX.Element {
  const { t } = useI18n();
  const navigationItems = [
    { to: "/", label: t("nav.home") },
    { to: "/challenge/new", label: t("nav.create") },
    { to: "/history", label: t("nav.history") },
    { to: "/settings", label: t("nav.settings") },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-2xl px-4 pb-4 safe-pb">
      <div className="grid grid-cols-4 gap-1 rounded-[32px] border border-slate-200/80 bg-slate-50/90 p-2 shadow-card backdrop-blur-xl">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex min-h-14 items-center justify-center rounded-[24px] px-3 text-sm font-medium text-slate-500 transition duration-200 hover:bg-slate-100/90 hover:text-ink",
                isActive &&
                  "bg-moss-500 text-slate-900 shadow-soft hover:bg-moss-500 hover:text-slate-900",
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
