import { useState } from "react";
import { AlertCircle, AlertTriangle, Info, RefreshCw, X, Loader2, CheckCircle2, Clock, Lock } from "lucide-react";
import { cn } from "./Button";
import { AuthStatus } from "../../data/types";

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
    error: "bg-error-light border-error/20",
    warning: "bg-warning-light border-warning/20",
    info: "bg-info-light border-info/20",
  };
  const iconCls = {
    error: "text-error-foreground",
    warning: "text-warning-foreground",
    info: "text-info-foreground",
  };
  const textCls = {
    error: "text-error-foreground",
    warning: "text-warning-foreground",
    info: "text-info-foreground",
  };
  const Icons = { error: AlertCircle, warning: AlertTriangle, info: Info };
  const Icon = Icons[type];

  return (
    <div className={cn("flex items-center gap-3 px-4 py-3 rounded-lg border", styles[type], className)}>
      <Icon className={cn("w-4 h-4 flex-shrink-0", iconCls[type])} />
      <p className={cn("flex-1 text-sm font-medium", textCls[type])}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className={cn("text-xs flex items-center gap-1 flex-shrink-0 hover:underline font-semibold", iconCls[type])}
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

export function AuthStatusBanner({ status, onDismiss }: { status?: AuthStatus; onDismiss?: () => void }) {
  if (!status || status === "idle") return null;

  type Cfg = { icon: React.ElementType; bg: string; iconCls: string; textCls: string; message: string };
  const cfgs: Record<Exclude<AuthStatus, "idle">, Cfg> = {
    loading: {
      icon: Loader2,
      bg: "bg-primary-light border-primary/20",
      iconCls: "text-primary animate-spin",
      textCls: "text-primary",
      message: "Signing you in…",
    },
    success: {
      icon: CheckCircle2,
      bg: "bg-success-light border-success/20",
      iconCls: "text-success-foreground",
      textCls: "text-success-foreground",
      message: "Signed in successfully. Redirecting…",
    },
    "session-expired": {
      icon: Clock,
      bg: "bg-warning-light border-warning/20",
      iconCls: "text-warning-foreground",
      textCls: "text-warning-foreground",
      message: "Your session expired. Please sign in again.",
    },
    unauthorized: {
      icon: Lock,
      bg: "bg-error-light border-error/20",
      iconCls: "text-error-foreground",
      textCls: "text-error-foreground",
      message: "You don't have permission to access that page.",
    },
    "logout-success": {
      icon: CheckCircle2,
      bg: "bg-success-light border-success/20",
      iconCls: "text-success-foreground",
      textCls: "text-success-foreground",
      message: "You've been signed out successfully.",
    },
  };

  const { icon: Icon, bg, iconCls, textCls, message } = cfgs[status];

  return (
    <div className={cn("flex items-center gap-3 px-4 py-3 rounded-lg border mb-5", bg)}>
      <Icon className={cn("w-4 h-4 flex-shrink-0", iconCls)} />
      <p className={cn("flex-1 text-sm font-medium", textCls)}>{message}</p>
      {onDismiss && status !== "loading" && status !== "success" && (
        <button onClick={onDismiss} className={cn("flex-shrink-0 hover:opacity-70 transition-opacity", iconCls)}>
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
