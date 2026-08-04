import { useState, useEffect } from "react";
import { Clock, Loader2, RefreshCw } from "lucide-react";
import { Screen } from "../../../data/types";
import { AuthLayout } from "../../components/AuthLayout";
import { Button, cn } from "../../components/Button";
import { SupportCard } from "../../components/SupportCard";

export function PaymentPendingScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(iv);
  }, []);

  const pendingStates = [
    "Verifying payment with Razorpay...",
    "Provisioning course access...",
    "Generating invoice...",
    "Setting up your account...",
  ];

  return (
    <AuthLayout>
      <div>
        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mb-6">
          <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">Setting up your account</h1>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          We're setting up your account. This may take a few minutes.
        </p>

        <div className="space-y-2 mb-5">
          {[
            { label: "Course Access Not Yet Created", hint: "We're provisioning your enrollment." },
            { label: "Invoice Not Yet Generated", hint: "Your invoice is being created." },
            { label: "Payment Verification Pending", hint: "Awaiting webhook confirmation." },
          ].map((item, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
                tick % 3 === i
                  ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40"
                  : "bg-card border-border opacity-60"
              )}
            >
              <Loader2
                className={cn(
                  "w-4 h-4 flex-shrink-0 transition-all",
                  tick % 3 === i ? "text-amber-600 dark:text-amber-400 animate-spin" : "text-muted-foreground"
                )}
              />
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-xs font-semibold",
                    tick % 3 === i ? "text-amber-800 dark:text-amber-300" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </p>
                {tick % 3 === i && (
                  <p className="text-xs text-amber-700/70 dark:text-amber-400/70 mt-0.5">
                    {pendingStates[tick % pendingStates.length]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          You'll receive an email at <strong className="text-foreground">sarah.chen@example.com</strong> as soon as everything's ready.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <Button variant="secondary" className="flex-1" onClick={() => onNavigate("student-dashboard")}>
            <RefreshCw className="w-4 h-4" />
            Check dashboard
          </Button>
        </div>

        <SupportCard type="payment" />
      </div>
    </AuthLayout>
  );
}
