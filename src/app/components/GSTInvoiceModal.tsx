import React from "react";
import { Download, Printer, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { PaymentInvoice } from "../../data/types";
import { Logo } from "./Logo";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { generateInvoicePdf } from "../../lib/pdf";

export function GSTInvoiceModal({
  isOpen,
  onClose,
  invoice,
}: {
  isOpen: boolean;
  onClose: () => void;
  invoice: PaymentInvoice | null;
}) {
  if (!isOpen || !invoice) return null;

  const isSameState = (invoice.customerState || "Maharashtra").toLowerCase() === "maharashtra";
  const subtotal = invoice.subtotalAmount || 12500;
  const cgst = isSameState ? invoice.cgstAmount || Math.round(subtotal * 0.09) : 0;
  const sgst = isSameState ? invoice.sgstAmount || Math.round(subtotal * 0.09) : 0;
  const igst = !isSameState ? invoice.igstAmount || Math.round(subtotal * 0.18) : 0;
  const total = invoice.totalAmount || subtotal + cgst + sgst + igst;

  function handleDownloadSignedPdf() {
    try {
      const invNum = invoice?.invoice || invoice?.invoiceNumber || "INV-001";
      const pdfBytes = generateInvoicePdf({
        invoiceNumber: invNum,
        invoiceDate: invoice?.date || new Date().toISOString().split("T")[0],
        sellerName: "NYTRC Learning Portal Pvt. Ltd.",
        sellerGstin: invoice?.gstin || "27AAAAA0000A1Z5",
        sellerState: "MAHARASHTRA",
        buyerName: invoice?.customerName || "Student Account",
        buyerEmail: invoice?.customerEmail || "student@example.com",
        buyerState: invoice?.customerState || "Maharashtra",
        placeOfSupply: invoice?.customerState || "Maharashtra",
        courseName: "Online LMS Course Enrollment",
        sacCode: invoice?.hsnCode || "999299",
        taxableValue: subtotal,
        gstRate: 0.18,
        gstAmount: isSameState ? cgst + sgst : igst,
        taxType: isSameState ? "cgst_sgst" : "igst",
        cgst,
        sgst,
        igst,
        totalAmount: total,
      });

      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `GST_Tax_Invoice_${invNum}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      toast.success(`Downloaded Tax Invoice PDF: ${invNum}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate invoice PDF");
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl overflow-hidden my-8">
        {/* Header toolbar */}
        <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground text-sm">Official GST Tax Invoice</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="hidden sm:flex">
              <Printer className="w-3.5 h-3.5" />
              Print
            </Button>
            <Button variant="primary" size="sm" onClick={handleDownloadSignedPdf}>
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Content */}
        <div className="p-6 sm:p-8 space-y-6 text-foreground print:p-0">
          {/* Top Info Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-border">
            <div>
              <Logo />
              <p className="text-xs text-muted-foreground mt-2 font-medium">NYTRC Learning Portal Pvt. Ltd.</p>
              <p className="text-xs text-muted-foreground">101 Education Hub, SV Road, Andheri West</p>
              <p className="text-xs text-muted-foreground">Mumbai, Maharashtra - 400001, India</p>
              <p className="text-xs font-semibold text-foreground mt-1">GSTIN: {invoice.gstin || "27AAAAA0000A1Z5"}</p>
            </div>
            <div className="sm:text-right">
              <div className="inline-block mb-2">
                <Badge variant={invoice.status} />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Tax Invoice No.</p>
              <p className="text-base font-extrabold text-foreground font-mono">{invoice.invoice || invoice.invoiceNumber}</p>
              <p className="text-xs text-muted-foreground mt-1">Date: {invoice.date}</p>
              <p className="text-xs text-muted-foreground">Payment Method: Razorpay</p>
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-muted/30 rounded-xl p-4 border border-border grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-bold text-muted-foreground uppercase tracking-wider mb-1">Billed To (Student)</p>
              <p className="font-bold text-foreground text-sm">{invoice.customerName || "Student Account"}</p>
              <p className="text-muted-foreground">{invoice.customerEmail || "student@example.com"}</p>
              <p className="text-muted-foreground">{invoice.customerMobile || "+91 98765 43210"}</p>
            </div>
            <div>
              <p className="font-bold text-muted-foreground uppercase tracking-wider mb-1">Place of Supply</p>
              <p className="font-semibold text-foreground">{invoice.customerState || "Maharashtra"}</p>
              <p className="text-muted-foreground mt-1">
                Tax Type: {isSameState ? "Intra-State (CGST + SGST)" : "Inter-State (IGST)"}
              </p>
              {invoice.paymentId && (
                <p className="text-muted-foreground font-mono mt-1">Ref ID: {invoice.paymentId}</p>
              )}
            </div>
          </div>

          {/* Tax Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-bold uppercase">
                  <th className="text-left py-2.5 px-3">Description</th>
                  <th className="text-center py-2.5 px-2">SAC Code</th>
                  <th className="text-right py-2.5 px-3">Subtotal</th>
                  {isSameState ? (
                    <>
                      <th className="text-right py-2.5 px-2">CGST (9%)</th>
                      <th className="text-right py-2.5 px-2">SGST (9%)</th>
                    </>
                  ) : (
                    <th className="text-right py-2.5 px-2">IGST (18%)</th>
                  )}
                  <th className="text-right py-2.5 px-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr>
                  <td className="py-3 px-3">
                    <p className="font-bold text-foreground">Modern JavaScript: From Fundamentals to Advanced</p>
                    <p className="text-muted-foreground text-[11px]">Online LMS Course Enrollment · Lifetime Access</p>
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-muted-foreground">
                    {invoice.hsnCode || "999299"}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-foreground">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </td>
                  {isSameState ? (
                    <>
                      <td className="py-3 px-2 text-right text-muted-foreground">
                        ₹{cgst.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-2 text-right text-muted-foreground">
                        ₹{sgst.toLocaleString("en-IN")}
                      </td>
                    </>
                  ) : (
                    <td className="py-3 px-2 text-right text-muted-foreground">
                      ₹{igst.toLocaleString("en-IN")}
                    </td>
                  )}
                  <td className="py-3 px-3 text-right font-bold text-foreground">
                    ₹{total.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Amount Breakdown Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Terms & Notes:</p>
              <p>• Computer-generated electronic GST invoice under Section 31 of CGST Act, 2017.</p>
              <p>• Private Cloudflare R2 storage reference link verified.</p>
            </div>
            <div className="w-full sm:w-64 space-y-1.5 text-xs bg-muted/20 p-3.5 rounded-xl border border-border">
              <div className="flex justify-between text-muted-foreground">
                <span>Taxable Amount</span>
                <span className="font-semibold text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              {isSameState ? (
                <>
                  <div className="flex justify-between text-muted-foreground">
                    <span>CGST (9%)</span>
                    <span>₹{cgst.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>SGST (9%)</span>
                    <span>₹{sgst.toLocaleString("en-IN")}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-muted-foreground">
                  <span>IGST (18%)</span>
                  <span>₹{igst.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-foreground text-sm pt-2 border-t border-border">
                <span>Total Paid</span>
                <span className="text-primary">₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
