import React from "react";
import { Loader2 } from "lucide-react";

export function cn(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 active:scale-[0.97] " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none";
  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-primary shadow-xs",
    secondary:
      "bg-card text-foreground border border-border hover:bg-muted focus-visible:ring-primary shadow-xs",
    ghost: "text-foreground hover:bg-muted focus-visible:ring-primary",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive-hover focus-visible:ring-destructive shadow-xs",
    outline:
      "border border-border bg-transparent text-foreground hover:bg-muted focus-visible:ring-primary shadow-xs",
  };
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-base" };
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  );
}
