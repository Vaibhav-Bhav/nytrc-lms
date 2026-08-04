import React from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "./Button";

export type NotifState = "sent" | "pending" | "failed";

export function NotificationStatus({ state, label }: { state: NotifState; label?: string }) {
  const configs: Record<NotifState, { icon: React.ElementType; cls: string; bg: string; text: string }> = {
    sent:    { icon: Check,       cls: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40", text: label ?? "Notification sent" },
    pending: { icon: Loader2,     cls: "text-amber-700 dark:text-amber-400",    bg: "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40",         text: label ?? "Sending notification..." },
    failed:  { icon: AlertCircle, cls: "text-destructive",                       bg: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40",                text: label ?? "Notification failed" },
  };
  const { icon: Icon, cls, bg, text } = configs[state];
  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium", bg)}>
      <Icon className={cn("w-3.5 h-3.5 flex-shrink-0", cls, state === "pending" && "animate-spin")} />
      <span className={cls}>{text}</span>
    </div>
  );
}
