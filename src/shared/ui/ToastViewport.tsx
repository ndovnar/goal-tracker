import { useEffect } from "react";

import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/shared/lib/cn";

const toneClasses = {
  success: "border-moss-200 bg-moss-50 text-moss-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
  info: "border-slate-200 bg-white text-slate-900",
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
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 mx-auto flex max-w-md flex-col gap-3 px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto rounded-2xl border px-4 py-3 text-sm font-medium shadow-soft backdrop-blur",
            toneClasses[toast.tone],
          )}
        >
          {toast.title}
        </div>
      ))}
    </div>
  );
}
