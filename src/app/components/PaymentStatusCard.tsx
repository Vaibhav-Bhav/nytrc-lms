import React from "react";
import { Loader2, CheckCircle2, AlertCircle, Clock, X, RefreshCw } from "lucide-react";
import { PaymentState } from "../../data/types";
import { cn } from "./Button";

export function PaymentStatusCard({
  status,
  orderId,
  amount,
  description,
}: {
  status: PaymentState;
  orderId?: string;
  amount?: string;
  description?: string;
}) {
  type Cfg = { icon: React.ElementType; iconCls: string; bg: string; label: string; labelCls: string };
  const cfgs: Record<PaymentState, Cfg> = {
    processing: { icon: Loader2,       iconCls: "text-primary animate-spin",              bg: "bg-primary/10",                              label: "Processing payment...", labelCls: "text-primary" },
    paid:       { icon: CheckCircle2,  iconCls: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20",        label: "Payment confirmed",     labelCls: "text-emerald-700 dark:text-emerald-400" },
    failed:     { icon: AlertCircle,   iconCls: "text-destructive",                       bg: "bg-red-50 dark:bg-red-900/20",                label: "Payment failed",        labelCls: "text-destructive" },
    pending:    { icon: Clock,         iconCls: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-900/20",            label: "Payment pending",       labelCls: "text-amber-700 dark:text-amber-400" },
    cancelled:  { icon: X,             iconCls: "text-muted-foreground",                  bg: "bg-muted",                                    label: "Payment cancelled",     labelCls: "text-muted-foreground" },
    refunded:   { icon: RefreshCw,     iconCls: "text-muted-foreground",                  bg: "bg-muted",                                    label: "Refunded",              labelCls: "text-muted-foreground" },
  };
  const { icon: Icon, iconCls, bg, label, labelCls } = cfgs[status];
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-4">
      <div className="flex items-start gap-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", bg)}>
          <Icon className={cn("w-5 h-5", iconCls)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("font-semibold text-sm", labelCls)}>{label}</p>
          {description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>}
          {orderId && <p className="text-xs text-muted-foreground mt-0.5">Order {orderId}</p>}
        </div>
        {amount && <span className="text-sm font-semibold text-foreground flex-shrink-0">{amount}</span>}
      </div>
    </div>
  );
}
