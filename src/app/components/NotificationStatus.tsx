import React from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "./Button";

export type NotifState = "sent" | "pending" | "failed";

export function NotificationStatus({ state, label }: { state: NotifState; label?: string }) {
  const configs: Record<NotifState, { icon: React.ElementType; cls: string; bg: string; text: string }> = {
    sent:    { icon: Check,       cls: "text-success-foreground", bg: "bg-success-light border border-success/20", text: label ?? "Notification sent" },
    pending: { icon: Loader2,     cls: "text-warning-foreground", bg: "bg-warning-light border border-warning/20", text: label ?? "Sending notification..." },
    failed:  { icon: AlertCircle, cls: "text-error-foreground",   bg: "bg-error-light border border-error/20",     text: label ?? "Notification failed" },
  };
  const { icon: Icon, cls, bg, text } = configs[state];
  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium", bg)}>
      <Icon className={cn("w-3.5 h-3.5 flex-shrink-0", cls, state === "pending" && "animate-spin")} />
      <span className={cls}>{text}</span>
    </div>
  );
}
