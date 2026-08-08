import React from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";
import { Button, cn } from "./Button";

export interface ConfirmDialogProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title: string;
  description?: string;
  warning?: string;
  confirmLabel?: string;
  confirmText?: string;
  confirmVariant?: "primary" | "destructive";
  variant?: "primary" | "destructive" | "secondary" | "outline";
  icon?: React.ElementType;
}

export function ConfirmModal({
  open,
  isOpen,
  onClose,
  onConfirm,
  loading,
  title,
  description,
  warning,
  confirmLabel,
  confirmText,
  confirmVariant,
  variant,
  icon: Icon,
}: ConfirmDialogProps) {
  const isVisible = open ?? isOpen ?? false;
  const btnLabel = confirmText || confirmLabel || "Confirm";
  const btnVariant = (variant === "destructive" || confirmVariant === "destructive") ? "destructive" : "primary";

  const iconBg = btnVariant === "destructive" ? "bg-error-light" : "bg-warning-light";
  const iconCls = btnVariant === "destructive" ? "text-error-foreground" : "text-warning-foreground";

  return (
    <Modal
      open={isVisible}
      onClose={() => !loading && onClose()}
      title={title}
      actions={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={btnVariant} size="sm" loading={loading} onClick={onConfirm}>
            {btnLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        {Icon ? (
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", iconBg)}>
            <Icon className={cn("w-5 h-5", iconCls)} />
          </div>
        ) : (
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", iconBg)}>
            <AlertTriangle className={cn("w-5 h-5", iconCls)} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {description && <p className="text-sm text-muted-foreground leading-relaxed mb-3">{description}</p>}
          {warning && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-warning-light rounded-lg border border-warning/30">
              <AlertTriangle className="w-4 h-4 text-warning-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-warning-foreground leading-relaxed font-medium">{warning}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export const ConfirmDialog = ConfirmModal;
