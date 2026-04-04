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
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-5xl px-4 pb-4 safe-pb md:px-6">
      <div className="grid grid-cols-4 gap-2 rounded-[28px] border border-white/70 bg-white/95 p-2 shadow-card backdrop-blur">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex min-h-14 items-center justify-center rounded-2xl text-sm font-semibold text-slate-500 transition",
                isActive && "bg-moss-100 text-moss-800",
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
