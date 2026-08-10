import { CheckCircle2, Mail, Download } from "lucide-react";
import { toast } from "sonner";
import { Screen } from "../../../data/types";
import { INITIAL_COURSES } from "../../../data/mockData";
import { AuthLayout } from "../../components/AuthLayout";
import { Button } from "../../components/Button";

export function PaymentSuccessScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const COURSE = INITIAL_COURSES[0];
  return (
    <AuthLayout>
      <div>
        <div className="w-12 h-12 rounded-full bg-success-light flex items-center justify-center mb-6">
          <CheckCircle2 className="w-6 h-6 text-success-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Payment confirmed</h1>
        <p className="text-muted-foreground text-sm mb-6 font-medium">Order #NYTRC-2025-1047</p>
        <div className="bg-muted/50 rounded-2xl px-5 py-4 mb-5 border border-border">
          <p className="text-sm font-bold text-foreground mb-1">{COURSE.title}</p>
          <p className="text-sm text-muted-foreground">₹14,750 · Paid (incl. GST)</p>
        </div>
        <div className="flex items-start gap-3 px-4 py-3.5 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/15 mb-6">
          <Mail className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground leading-relaxed">
            Your login details have been sent to{" "}
            <strong className="font-bold">sarah.chen@example.com</strong>.{" "}
            Check your inbox — it may take a few minutes.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => onNavigate?.("login")} className="flex-1">
            Go to login
          </Button>
          <Button variant="secondary" onClick={() => toast.success("Invoice downloaded")}>
            <Download className="w-4 h-4" />
            Invoice
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
