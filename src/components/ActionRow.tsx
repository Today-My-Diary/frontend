import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const actionRowVariants = cva(
  "flex w-full items-center gap-4 rounded-md px-5 py-2.5 transition text-left",
  {
    variants: {
      variant: {
        default: "bg-primary-light",
        success: "bg-background-success/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface ActionRowProps extends VariantProps<typeof actionRowVariants> {
  icon?: ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
}

export function ActionRow({
  variant,
  icon,
  title,
  description,
  onClick,
}: ActionRowProps) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      type={onClick ? "button" : undefined}
      className={cn(
        actionRowVariants({ variant }),
        onClick && "cursor-pointer hover:scale-[1.01] hover:opacity-90",
      )}
      onClick={onClick}
    >
      <div className="flex size-10 shrink-0 items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-md text-secondary mt-1 font-semibold break-keep">
          {title}
        </p>
        {description && (
          <p className="text-secondary mt-0.5 text-xs">{description}</p>
        )}
      </div>
    </Component>
  );
}
