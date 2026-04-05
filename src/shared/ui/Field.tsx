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
          "min-h-12 rounded-[24px] border border-slate-200/80 bg-slate-100/90 px-4 py-3 text-sm text-ink outline-none transition duration-200 placeholder:text-slate-400 focus:border-moss-400 focus:bg-slate-50 focus:ring-4 focus:ring-moss-200/40 disabled:bg-slate-50 disabled:text-slate-400",
          error &&
            "border-rose-500 focus:border-rose-400 focus:ring-rose-900/60",
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-rose-300">{error}</span> : null}
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
          "min-h-28 rounded-[24px] border border-slate-200/80 bg-slate-100/90 px-4 py-3 text-sm text-ink outline-none transition duration-200 placeholder:text-slate-400 focus:border-moss-400 focus:bg-slate-50 focus:ring-4 focus:ring-moss-200/40 disabled:bg-slate-50 disabled:text-slate-400",
          error &&
            "border-rose-500 focus:border-rose-400 focus:ring-rose-900/60",
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-rose-300">{error}</span> : null}
    </label>
  );
}
