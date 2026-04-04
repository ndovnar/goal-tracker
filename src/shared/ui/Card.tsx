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
        "rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-card backdrop-blur",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
