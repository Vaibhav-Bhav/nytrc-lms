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

  const iconBg = btnVariant === "destructive" ? "bg-red-100 dark:bg-red-900/20" : "bg-amber-100 dark:bg-amber-900/20";
  const iconCls = btnVariant === "destructive" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400";

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
            <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/40">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">{warning}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export const ConfirmDialog = ConfirmModal;
