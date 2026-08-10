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
        <div className="w-12 h-12 rounded-full bg-warning-light flex items-center justify-center mb-6">
          <Clock className="w-6 h-6 text-warning-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Setting up your account</h1>
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
                "flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all",
                tick % 3 === i
                  ? "bg-warning-light border-warning/30"
                  : "bg-card border-border opacity-60"
              )}
            >
              <Loader2
                className={cn(
                  "w-4 h-4 flex-shrink-0 transition-all",
                  tick % 3 === i ? "text-warning-foreground animate-spin" : "text-muted-foreground"
                )}
              />
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-xs font-bold",
                    tick % 3 === i ? "text-warning-foreground" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </p>
                {tick % 3 === i && (
                  <p className="text-xs text-warning-foreground/80 mt-0.5 font-medium">
                    {pendingStates[tick % pendingStates.length]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          You'll receive an email at <strong className="text-foreground font-bold">sarah.chen@example.com</strong> as soon as everything's ready.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <Button variant="secondary" className="flex-1" onClick={() => onNavigate?.("student-dashboard")}>
            <RefreshCw className="w-4 h-4" />
            Check dashboard
          </Button>
        </div>

        <SupportCard type="payment" />
      </div>
    </AuthLayout>
  );
}
