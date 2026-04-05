import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  icon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-ink bg-ink text-white shadow-soft hover:border-slate-900 hover:bg-slate-900 disabled:border-slate-300 disabled:bg-slate-300 disabled:text-white",
  secondary:
    "border border-slate-200 bg-white/72 text-ink hover:border-slate-300 hover:bg-white disabled:border-slate-200 disabled:bg-white/50 disabled:text-slate-400",
  ghost:
    "border border-transparent bg-transparent text-slate-600 hover:bg-white/60 hover:text-ink disabled:text-slate-400",
  danger:
    "border border-rose-500 bg-rose-500 text-white shadow-soft hover:border-rose-600 hover:bg-rose-600 disabled:border-rose-200 disabled:bg-rose-200 disabled:text-white",
};

export function Button({
  children,
  className,
  variant = "primary",
  fullWidth = false,
  icon,
  type = "button",
  ...props
}: ButtonProps): JSX.Element {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-moss-100 disabled:cursor-not-allowed",
        variantClasses[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
