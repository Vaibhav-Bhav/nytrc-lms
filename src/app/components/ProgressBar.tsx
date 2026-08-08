import { cn } from "./Button";

export function ProgressBar({ value, color = "primary" }: { value: number; color?: "primary" | "green" | "amber" }) {
  const pct = Math.min(100, Math.max(0, value));
  const colors = {
    primary: "bg-primary",
    green: "bg-success",
    amber: "bg-warning",
  };
  return (
    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
      <div className={cn("h-full rounded-full transition-all duration-300", colors[color])} style={{ width: `${pct}%` }} />
    </div>
  );
}
