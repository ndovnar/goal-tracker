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
    "bg-ink text-white shadow-soft hover:bg-slate-800 disabled:bg-slate-400 disabled:text-white",
  secondary:
    "bg-white text-ink border border-slate-200 hover:border-moss-300 hover:bg-moss-50 disabled:text-slate-400",
  ghost: "bg-transparent text-ink hover:bg-white/70 disabled:text-slate-400",
  danger:
    "bg-sand-700 text-white shadow-soft hover:bg-sand-800 disabled:bg-sand-300 disabled:text-white",
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
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition",
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
