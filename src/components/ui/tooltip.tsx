import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Tooltip({ children, className, ...props }: TooltipProps) {
  return (
    <div className={cn("relative mb-2 inline-block", className)} {...props}>
      <div className="bg-primary rounded-full px-3 py-1 text-sm text-white">
        {children}
      </div>
      <div className="border-t-primary absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 border-6 border-r-transparent border-b-transparent border-l-transparent" />
    </div>
  );
}
