import { BookOpen } from "lucide-react";
import { cn } from "./Button";

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 flex-shrink-0">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", inverted ? "bg-white/20" : "bg-primary")}>
        <BookOpen className="w-4 h-4 text-white" strokeWidth={2.5} />
      </div>
      <span className={cn("font-extrabold text-lg tracking-wider leading-none", inverted ? "text-white" : "text-foreground")}>
        NYTRC
      </span>
    </div>
  );
}
