import { Download } from "lucide-react";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { PaymentInvoice } from "../../data/types";

export function InvoiceCard({
  inv,
  onDownload,
  onViewInvoice,
}: {
  inv: PaymentInvoice;
  onDownload?: () => void;
  onViewInvoice?: (inv: PaymentInvoice) => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-t border-border first:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{inv.invoice || inv.invoiceNumber}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{inv.date}</p>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-4">
        <span className="text-sm font-semibold text-foreground hidden sm:block">{inv.amount}</span>
        <Badge variant={inv.status} />
        <Button variant="ghost" size="sm" onClick={() => onViewInvoice ? onViewInvoice(inv) : onDownload?.()}>
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">GST Invoice</span>
        </Button>
      </div>
    </div>
  );
}
