import { Loader2 } from "lucide-react";
import { cn } from "./Button";

export function Skel({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn("animate-pulse bg-muted rounded-lg", className)} style={style} />;
}

export function LoadingSpinner({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-9 h-9" };
  return <Loader2 className={cn("animate-spin text-muted-foreground", sizes[size], className)} />;
}
