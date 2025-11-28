import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  cn(
    "cursor-pointer rounded-full px-5 py-2 font-semibold hover:scale-[1.02] transition-all",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
  ),
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-b from-gradient-primary-start to-gradient-primary-end text-white hover:opacity-90",
        secondary: "bg-secondary-semilight text-white hover:opacity-90",
        white: "bg-white/40 text-white hover:bg-white/50",
        ghost: "bg-transparent text-secondary",
        glass:
          "bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 border-none font-light",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-2 text-base",
        lg: "px-8 py-3.5 text-lg",
        icon: "h-9 w-9 p-2 flex items-center justify-center",
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
