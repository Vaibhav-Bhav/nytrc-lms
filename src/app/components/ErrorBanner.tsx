import { useState } from "react";
import { AlertCircle, AlertTriangle, Info, RefreshCw, X } from "lucide-react";
import { cn } from "./Button";

export function ErrorBanner({
  message,
  onRetry,
  onDismiss,
  type = "error",
  className,
}: {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  type?: "error" | "warning" | "info";
  className?: string;
}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const styles = {
    error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40",
    warning: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40",
    info: "bg-primary/5 dark:bg-primary/10 border-primary/15",
  };
  const iconCls = {
    error: "text-red-600 dark:text-red-400",
    warning: "text-amber-600 dark:text-amber-400",
    info: "text-primary",
  };
  const textCls = {
    error: "text-red-700 dark:text-red-300",
    warning: "text-amber-800 dark:text-amber-300",
    info: "text-primary/90",
  };
  const Icons = { error: AlertCircle, warning: AlertTriangle, info: Info };
  const Icon = Icons[type];

  return (
    <div className={cn("flex items-center gap-3 px-4 py-3 rounded-lg border", styles[type], className)}>
      <Icon className={cn("w-4 h-4 flex-shrink-0", iconCls[type])} />
      <p className={cn("flex-1 text-sm", textCls[type])}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className={cn("text-xs flex items-center gap-1 flex-shrink-0 hover:underline", iconCls[type])}
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      )}
      <button
        onClick={() => {
          setDismissed(true);
          onDismiss?.();
        }}
        className={cn("flex-shrink-0 hover:opacity-70 transition-opacity", iconCls[type])}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
