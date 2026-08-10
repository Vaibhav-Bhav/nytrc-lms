import { AlertCircle, RefreshCw } from "lucide-react";
import { Screen } from "../../../data/types";
import { AuthLayout } from "../../components/AuthLayout";
import { Button } from "../../components/Button";
import { SupportCard } from "../../components/SupportCard";

export function PaymentFailedScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <AuthLayout>
      <div>
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-6">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Payment failed</h1>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          Your payment couldn't be processed. No charge was made. This can happen if your card was declined or the session timed out.
        </p>
        <div className="bg-muted/50 rounded-2xl px-5 py-4 mb-6 border border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Error detail</p>
          <p className="text-sm font-semibold text-foreground">Card declined by issuing bank</p>
          <p className="text-xs text-muted-foreground mt-0.5">Code: INSUFFICIENT_FUNDS</p>
        </div>
        <Button className="w-full mb-4" onClick={() => onNavigate?.("checkout")}>
          <RefreshCw className="w-4 h-4" />
          Try again
        </Button>
        <SupportCard type="payment" />
      </div>
    </AuthLayout>
  );
}
