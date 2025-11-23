import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import loading_icon from "@/assets/icons/loading_icon.svg";

const loadingVariants = cva("flex h-full w-full items-center justify-center", {
  variants: {
    variant: {
      default: "bg-background-primary",
      primary: "bg-primary-light",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function Loading({ variant }: VariantProps<typeof loadingVariants>) {
  return (
    <div className={cn(loadingVariants({ variant }))}>
      <img
        src={loading_icon}
        role="status"
        aria-label="Loading"
        className="size-10 animate-spin"
      />
    </div>
  );
}
