import { useEffect } from "react";

import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/shared/lib/cn";

const toneClasses = {
  success: "border-moss-300 bg-slate-50/96 text-moss-800",
  error: "border-rose-700 bg-slate-50/96 text-rose-300",
  info: "border-slate-200 bg-slate-50/96 text-slate-800",
};

export function ToastViewport(): JSX.Element {
  const toasts = useAppStore((state) => state.toasts);
  const dismissToast = useAppStore((state) => state.dismissToast);
  useEffect(() => {
    const timeoutIds = toasts.map((toast) =>
      window.setTimeout(() => {
        dismissToast(toast.id);
      }, 3600),
    );
    return () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [dismissToast, toasts]);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-5 z-50 mx-auto flex max-w-lg flex-col gap-3 px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto rounded-[24px] border px-4 py-3 text-sm font-medium shadow-soft backdrop-blur-xl",
            toneClasses[toast.tone],
          )}
        >
          {toast.title}
        </div>
      ))}
    </div>
  );
}
