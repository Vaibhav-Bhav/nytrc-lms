import { Search, X } from "lucide-react";
import { cn } from "./Button";

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Search..."}
        className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-border bg-card placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
