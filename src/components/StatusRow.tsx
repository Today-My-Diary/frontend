import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const statusRowVariants = cva(
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

interface StatusRowProps extends VariantProps<typeof statusRowVariants> {
  imgSrc: string;
  content: string;
  description?: string;
  onClick?: () => void;
}

export function StatusRow({
  variant,
  imgSrc,
  content,
  description,
  onClick,
}: StatusRowProps) {
  return (
    <button
      type="button"
      className={cn(
        statusRowVariants({ variant }),
        onClick && "cursor-pointer hover:scale-[1.01] hover:opacity-90",
      )}
      onClick={onClick}
    >
      <img src={imgSrc} alt="Icon" className="size-10" />
      <div>
        <p className="text-md text-secondary mt-1 font-semibold">{content}</p>
        {description && (
          <p className="text-secondary mt-0.5 text-xs">{description}</p>
        )}
      </div>
    </button>
  );
}
