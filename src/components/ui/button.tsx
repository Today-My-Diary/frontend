import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "cursor-pointer rounded-full px-5 py-2 font-semibold hover:scale-[1.02] transition-all",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-b from-gradient-primary-start to-gradient-primary-end text-white hover:opacity-90",
        secondary: "bg-secondary-semilight text-white hover:bg-secondary",
        ghost: "bg-transparent text-secondary hover:bg-secondary-light",
      },
      size: {
        sm: "px-3 py-1 text-sm",
        md: "px-5 py-2 text-base",
        lg: "px-8 py-3 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
}

export function Button({
  variant,
  size,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
