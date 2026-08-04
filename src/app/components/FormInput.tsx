import React from "react";
import { cn } from "./Button";

export function FormInput({
  label,
  error,
  wrapperClass,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  wrapperClass?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", wrapperClass)}>
      {label && <label className="text-sm font-semibold text-foreground">{label}</label>}
      <input
        className={cn(
          "w-full px-3 py-2 text-sm rounded-lg border bg-card placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error ? "border-destructive focus:ring-destructive/20" : "border-border",
        )}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
