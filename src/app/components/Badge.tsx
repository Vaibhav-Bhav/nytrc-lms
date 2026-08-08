import { BadgeVariant } from "../../data/types";
import { cn } from "./Button";

const BADGE_CONFIG: Record<BadgeVariant, { label: string; cls: string }> = {
  completed:          { label: "Completed",        cls: "bg-success-light text-success-foreground border-success/20" },
  "in-progress":      { label: "In Progress",      cls: "bg-warning-light text-warning-foreground border-warning/20" },
  locked:             { label: "Locked",            cls: "bg-error-light text-error-foreground border-error/20" },
  "continue-learning":{ label: "Continue",          cls: "bg-info-light text-info-foreground border-info/20" },
  "access-granted":   { label: "Access Granted",    cls: "bg-success-light text-success-foreground border-success/20" },
  "access-locked":    { label: "Access Locked",     cls: "bg-error-light text-error-foreground border-error/20" },
  "access-revoked":   { label: "Access Revoked",    cls: "bg-error-light text-error-foreground border-error/20" },
  draft:              { label: "Draft",             cls: "bg-warning-light text-warning-foreground border-warning/20" },
  published:          { label: "Published",         cls: "bg-success-light text-success-foreground border-success/20" },
  active:             { label: "Active",            cls: "bg-success-light text-success-foreground border-success/20" },
  pending:            { label: "Pending",           cls: "bg-warning-light text-warning-foreground border-warning/20" },
  uploading:          { label: "Uploading",         cls: "bg-info-light text-info-foreground border-info/20" },
  "upload-failed":    { label: "Upload Failed",     cls: "bg-error-light text-error-foreground border-error/20" },
  "upload-success":   { label: "Uploaded",          cls: "bg-success-light text-success-foreground border-success/20" },
  paid:               { label: "Paid",              cls: "bg-success-light text-success-foreground border-success/20" },
  failed:             { label: "Failed",            cls: "bg-error-light text-error-foreground border-error/20" },
  refunded:           { label: "Refunded",          cls: "bg-muted text-muted-foreground border-border" },
  cancelled:          { label: "Cancelled",         cls: "bg-muted text-muted-foreground border-border" },
  delivered:          { label: "Delivered",         cls: "bg-success-light text-success-foreground border-success/20" },
  "not-published":    { label: "Not Published",     cls: "bg-muted text-muted-foreground border-border" },
  upcoming:           { label: "Upcoming",          cls: "bg-info-light text-info-foreground border-info/20" },
  "refund-requested": { label: "Refund Requested",  cls: "bg-warning-light text-warning-foreground border-warning/20" },
  "refund-pending":   { label: "Refund Pending",    cls: "bg-warning-light text-warning-foreground border-warning/20" },
  "refund-complete":  { label: "Refund Complete",   cls: "bg-success-light text-success-foreground border-success/20" },
};

export function Badge({ variant }: { variant: BadgeVariant }) {
  const { label, cls } = BADGE_CONFIG[variant];
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border whitespace-nowrap", cls)}>
      {label}
    </span>
  );
}
