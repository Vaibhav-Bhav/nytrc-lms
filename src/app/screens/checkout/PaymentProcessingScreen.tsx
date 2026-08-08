import { Lock } from "lucide-react";
import { AuthLayout } from "../../components/AuthLayout";

export function PaymentProcessingScreen() {
  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-14 h-14 rounded-full border-4 border-primary border-t-transparent animate-spin mb-8" />
        <h1 className="text-2xl font-semibold text-foreground mb-3">Completing your payment</h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mb-8">
          You've been redirected to Razorpay to complete your purchase. Please do not close this window.
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <Lock className="w-3.5 h-3.5" />
          Secured by Razorpay
        </div>
      </div>
    </AuthLayout>
  );
}
