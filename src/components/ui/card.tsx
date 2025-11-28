import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

const cardVariants = cva(
  "rounded-lg shadow-md flex flex-col gap-2 items-center justify-center transition-transform hover:scale-[1.02] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-background-primary",
        white: "bg-background-white",
        light: "bg-secondary-light",
        primary: "bg-background-primary",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  },
);

interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children?: React.ReactNode;
}

export function Card({
  variant,
  padding,
  children,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    >
      {children}
    </div>
  );
}
