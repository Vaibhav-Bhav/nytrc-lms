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
    processing: { icon: Loader2,       iconCls: "text-primary animate-spin",              bg: "bg-primary-light",                           label: "Processing payment...", labelCls: "text-primary" },
    paid:       { icon: CheckCircle2,  iconCls: "text-success-foreground", bg: "bg-success-light",     label: "Payment confirmed",     labelCls: "text-success-foreground" },
    failed:     { icon: AlertCircle,   iconCls: "text-error-foreground",                    bg: "bg-error-light",             label: "Payment failed",        labelCls: "text-error-foreground" },
    pending:    { icon: Clock,         iconCls: "text-warning-foreground",                  bg: "bg-warning-light",         label: "Payment pending",       labelCls: "text-warning-foreground" },
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
