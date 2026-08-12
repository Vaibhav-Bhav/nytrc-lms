import { BookOpen } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "./Button";

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3 flex-shrink-0 select-none cursor-pointer group">
      <div
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-105 bg-primary text-primary-foreground"
        )}
      >
        <BookOpen className="w-5 h-5 text-white" strokeWidth={2.5} />
      </div>
      <div className="flex flex-col">
        <span
          className={cn(
            "font-extrabold text-lg tracking-wider leading-none",
            inverted ? "text-white" : "text-foreground"
          )}
        >
          NYTRC
        </span>
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-widest leading-none mt-1",
            inverted ? "text-slate-400" : "text-muted-foreground"
          )}
        >
          LMS Portal
        </span>
      </div>
    </Link>
  );
}
