import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function InputField({
  label,
  error,
  className,
  ...props
}: InputFieldProps): JSX.Element {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-ink">
      <span>{label}</span>
      <input
        className={cn(
          "min-h-12 rounded-[24px] border border-slate-200/80 bg-white/72 px-4 py-3 text-sm text-ink outline-none transition duration-200 placeholder:text-slate-400 focus:border-moss-300 focus:bg-white focus:ring-4 focus:ring-moss-100/70 disabled:bg-slate-50 disabled:text-slate-400",
          error &&
            "border-rose-300 focus:border-rose-400 focus:ring-rose-100/80",
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-rose-700">{error}</span> : null}
    </label>
  );
}

export function TextAreaField({
  label,
  error,
  className,
  ...props
}: TextAreaFieldProps): JSX.Element {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-ink">
      <span>{label}</span>
      <textarea
        className={cn(
          "min-h-28 rounded-[24px] border border-slate-200/80 bg-white/72 px-4 py-3 text-sm text-ink outline-none transition duration-200 placeholder:text-slate-400 focus:border-moss-300 focus:bg-white focus:ring-4 focus:ring-moss-100/70 disabled:bg-slate-50 disabled:text-slate-400",
          error &&
            "border-rose-300 focus:border-rose-400 focus:ring-rose-100/80",
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-rose-700">{error}</span> : null}
    </label>
  );
}
