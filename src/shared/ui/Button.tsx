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
    "border border-moss-500 bg-moss-500 text-slate-900 shadow-soft hover:border-moss-400 hover:bg-moss-400 disabled:border-slate-300 disabled:bg-slate-300 disabled:text-slate-600",
  secondary:
    "border border-slate-200 bg-slate-100/88 text-ink hover:border-slate-300 hover:bg-slate-50 disabled:border-slate-200 disabled:bg-slate-100/60 disabled:text-slate-400",
  ghost:
    "border border-transparent bg-transparent text-slate-600 hover:bg-slate-100/70 hover:text-ink disabled:text-slate-400",
  danger:
    "border border-rose-500 bg-rose-500 text-rose-50 shadow-soft hover:border-rose-400 hover:bg-rose-400 disabled:border-rose-900 disabled:bg-rose-900 disabled:text-rose-300",
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
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-moss-200/60 disabled:cursor-not-allowed",
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
