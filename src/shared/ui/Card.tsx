import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({
  children,
  className,
  ...props
}: CardProps): JSX.Element {
  return (
    <div
      className={cn(
        "rounded-[32px] border border-slate-200/80 bg-white/74 p-6 shadow-card backdrop-blur-xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
