import { BadgeVariant } from "../../data/types";
import { cn } from "./Button";

const BADGE_CONFIG: Record<BadgeVariant, { label: string; cls: string }> = {
  completed:          { label: "Completed",        cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40" },
  "in-progress":      { label: "In Progress",      cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/40" },
  locked:             { label: "Locked",            cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/40" },
  "continue-learning":{ label: "Continue",          cls: "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:border-primary/30" },
  "access-granted":   { label: "Access Granted",    cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40" },
  "access-locked":    { label: "Access Locked",     cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/40" },
  "access-revoked":   { label: "Access Revoked",    cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/40" },
  "access-expired":   { label: "Access Expired",    cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/40" },
  draft:              { label: "Draft",             cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/40" },
  published:          { label: "Published",         cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40" },
  active:             { label: "Active",            cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40" },
  pending:            { label: "Pending",           cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/40" },
  uploading:          { label: "Uploading",         cls: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/40" },
  "upload-failed":    { label: "Upload Failed",     cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/40" },
  "upload-success":   { label: "Uploaded",          cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40" },
  paid:               { label: "Paid",              cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40" },
  failed:             { label: "Failed",            cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/40" },
  refunded:           { label: "Refunded",          cls: "bg-muted text-muted-foreground border-border" },
  cancelled:          { label: "Cancelled",         cls: "bg-muted text-muted-foreground border-border" },
  delivered:          { label: "Delivered",         cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40" },
  "not-published":    { label: "Not Published",     cls: "bg-muted text-muted-foreground border-border" },
  upcoming:           { label: "Upcoming",          cls: "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/40" },
  "refund-requested": { label: "Refund Requested",  cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/40" },
  "refund-pending":   { label: "Refund Pending",    cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/40" },
  "refund-complete":  { label: "Refund Complete",   cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40" },
};

export function Badge({ variant }: { variant: BadgeVariant }) {
  const config = BADGE_CONFIG[variant] || {
    label: String(variant || "Unknown"),
    cls: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border whitespace-nowrap", config.cls)}>
      {config.label}
    </span>
  );
}
