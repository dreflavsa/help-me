import { cn } from "../../lib/utils";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "bg-card text-on-surface flex flex-col gap-6 rounded-xl border border-outline-variant py-6 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("flex flex-col gap-1.5 px-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <div className={cn("font-semibold leading-none tracking-tight", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("px-6", className)} {...props} />;
}