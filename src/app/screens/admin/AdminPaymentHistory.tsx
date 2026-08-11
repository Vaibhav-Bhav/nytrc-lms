import { useState, useEffect } from "react";
import { Download, Search, ArrowLeft, Eye, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Screen, PaymentInvoice } from "../../../data/types";
import { AdminLayout } from "../../components/AdminLayout";
import { SearchInput } from "../../components/SearchInput";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { GSTInvoiceModal } from "../../components/GSTInvoiceModal";

interface AdminPaymentRow {
  id: string;
  student_name: string;
  student_email: string;
  course_title: string;
  invoice_number: string | null;
  invoice_download_url: string | null;
  payment_status: "pending" | "success" | "failed";
  amount_paid: number;
  currency: string;
  gst_state: string | null;
  razorpay_payment_id: string | null;
  razorpay_order_id: string | null;
  created_at: string;
}

function toPaymentInvoice(row: AdminPaymentRow): PaymentInvoice {
  return {
    id: row.id,
    date: new Date(row.created_at).toLocaleDateString("en-IN"),
    amount: `₹${row.amount_paid.toLocaleString("en-IN")}`,
    status: row.payment_status === "success" ? "paid" : row.payment_status === "failed" ? "cancelled" : "pending",
    invoice: row.invoice_number ?? "—",
    invoiceNumber: row.invoice_number ?? undefined,
    customerName: row.student_name,
    customerEmail: row.student_email,
    customerState: row.gst_state ?? undefined,
    totalAmount: row.amount_paid,
    paymentId: row.razorpay_payment_id ?? undefined,
    orderId: row.razorpay_order_id ?? undefined,
    downloadUrl: row.invoice_download_url ?? undefined,
  };
}

export function AdminPaymentHistory({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentInvoice | null>(null);
  const [payments, setPayments] = useState<AdminPaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchPayments() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/payments", { credentials: "include" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Error ${res.status}`);
      }
      const data: AdminPaymentRow[] = await res.json();
      setPayments(data);
    } catch (err: any) {
      setError(err.message || "Failed to load payments");
      toast.error(err.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPayments();
  }, []);

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.invoice_number ?? "").toLowerCase().includes(q) ||
      p.student_name.toLowerCase().includes(q) ||
      p.student_email.toLowerCase().includes(q) ||
      String(p.amount_paid).includes(q) ||
      new Date(p.created_at).toLocaleDateString("en-IN").includes(q)
    );
  });

  function handleExport() {
    const rows = [
      ["Date", "Student", "Email", "Invoice #", "Amount", "Status", "Payment ID"],
      ...filtered.map((p) => [
        new Date(p.created_at).toLocaleDateString("en-IN"),
        p.student_name,
        p.student_email,
        p.invoice_number ?? "",
        `₹${p.amount_paid.toLocaleString("en-IN")}`,
        p.payment_status,
        p.razorpay_payment_id ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nytrc-payments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Transactions exported as CSV");
  }

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
            <div className="flex items-center gap-2 self-start flex-shrink-0">
              <Button variant="secondary" size="sm" onClick={fetchPayments} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="secondary" size="sm" onClick={handleExport} disabled={loading || filtered.length === 0}>
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by student, invoice # or amount..." />
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 flex flex-col items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading payment records...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <p className="text-sm text-destructive font-medium">{error}</p>
                <Button variant="secondary" size="sm" className="mt-3" onClick={fetchPayments}>
                  Retry
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Student</th>
                      <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Course</th>
                      <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Invoice #</th>
                      <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                      <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
                      <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="text-right px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center">
                          <Search className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">
                            {payments.length === 0 ? "No payment records found" : "No records match your search"}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((p) => {
                        const initials = p.student_name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase();
                        const inv = toPaymentInvoice(p);
                        return (
                          <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-bold text-primary">{initials}</span>
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-foreground">{p.student_name}</p>
                                  <p className="text-xs text-muted-foreground">{p.student_email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-xs text-muted-foreground max-w-[160px] truncate">{p.course_title}</td>
                            <td className="px-4 py-3.5 text-sm font-semibold text-foreground font-mono">
                              {p.invoice_number ?? <span className="text-muted-foreground italic text-xs">Generating…</span>}
                            </td>
                            <td className="px-4 py-3.5 text-sm text-muted-foreground whitespace-nowrap">
                              {new Date(p.created_at).toLocaleDateString("en-IN")}
                            </td>
                            <td className="px-4 py-3.5 text-sm font-bold text-foreground tabular-nums">
                              ₹{p.amount_paid.toLocaleString("en-IN")}
                            </td>
                            <td className="px-4 py-3.5">
                              <Badge variant={inv.status} />
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedInvoice(inv)}>
                                <Eye className="w-3.5 h-3.5" />
                                View Invoice
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {filtered.length > 0 && !loading && (
            <p className="text-xs text-muted-foreground mt-3 text-right">
              Showing {filtered.length} of {payments.length} records
            </p>
          )}
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
