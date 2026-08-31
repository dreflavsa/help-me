import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-on-primary hover:opacity-90",
        outline: "border border-outline-variant bg-transparent text-on-surface hover:bg-surface-variant",
        ghost: "text-on-surface-variant hover:bg-surface-variant hover:text-on-surface",
      },
      size: {
        default: "h-9 px-4 text-sm",
        lg: "h-11 px-6 text-base",
        icon: "size-9",
        "icon-sm": "size-7",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export function Button({ className, variant, size, ...props }) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}