import { Fragment } from "react";
import { ChevronRight } from "lucide-react";

export function Breadcrumb({ items }: { items: { label: string; onClick?: () => void }[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm flex-wrap">
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
