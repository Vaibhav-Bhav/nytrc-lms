import { useState } from "react";
import { Download, Search, ArrowLeft, Eye } from "lucide-react";
import { toast } from "sonner";
import { Screen, PaymentInvoice } from "../../../data/types";
import { PAYMENT_HISTORY } from "../../../data/mockData";
import { AdminLayout } from "../../components/AdminLayout";
import { SearchInput } from "../../components/SearchInput";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { GSTInvoiceModal } from "../../components/GSTInvoiceModal";

export function AdminPaymentHistory({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentInvoice | null>(null);

  const payments = PAYMENT_HISTORY.filter(
    (p) =>
      (p.invoice || p.invoiceNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      p.amount.toLowerCase().includes(search.toLowerCase()) ||
      p.date.includes(search)
  );

  return (
    <AdminLayout>
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate?.("admin-dashboard")}
                className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Payment History</h1>
                <p className="text-muted-foreground text-sm mt-0.5">All student payment transactions and GST invoices</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toast.success("Exporting all transaction records (CSV)...")}
              className="self-start flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              Export Transactions
            </Button>
          </div>

          <div className="mb-6">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by invoice # or amount..." />
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Student
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Invoice #
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="text-right px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center">
                        <Search className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No payment records found</p>
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-primary">SC</span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">Sarah Chen</p>
                              <p className="text-xs text-muted-foreground">sarah.chen@example.com</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm font-semibold text-foreground font-mono">{p.invoice || p.invoiceNumber}</td>
                        <td className="px-4 py-3.5 text-sm text-muted-foreground whitespace-nowrap">{p.date}</td>
                        <td className="px-4 py-3.5 text-sm font-bold text-foreground tabular-nums">{p.amount}</td>
                        <td className="px-4 py-3.5">
                          <Badge variant={p.status} />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedInvoice(p)}>
                            <Eye className="w-3.5 h-3.5" />
                            View Invoice
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <GSTInvoiceModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />
    </AdminLayout>
  );
}
