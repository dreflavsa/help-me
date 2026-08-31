import { cn } from "../../lib/utils";

export function FieldGroup({ className, ...props }) {
  return <div className={cn("flex flex-col", className)} {...props} />;
}

export function Field({ className, ...props }) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}

export function FieldLabel({ className, ...props }) {
  return <label className={cn("mb-1", className)} {...props} />;
}

export function FieldDescription({ className, ...props }) {
  return (
    <p
      className={cn("text-xs text-on-surface-variant", className)}
      {...props}
    />
  );
}

export function FieldError({ className, ...props }) {
  return (
    <p className={cn("text-xs font-medium text-error", className)} {...props} />
  );
}
