import React from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  isOpen,
  onClose,
  title,
  children,
  actions,
  maxWidth = "sm:max-w-md",
}: {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: string;
}) {
  const isVisible = open ?? isOpen ?? false;
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-card rounded-t-2xl sm:rounded-xl shadow-2xl w-full ${maxWidth} border border-border`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
        {actions && (
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border bg-muted/20 rounded-b-2xl sm:rounded-b-xl">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
