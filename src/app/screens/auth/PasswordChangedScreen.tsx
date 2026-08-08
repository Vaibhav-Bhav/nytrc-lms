import { CheckCircle2, Shield } from "lucide-react";
import { Screen } from "../../../data/types";
import { AuthLayout } from "../../components/AuthLayout";
import { Button } from "../../components/Button";

export function PasswordChangedScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <AuthLayout>
      <div className="w-12 h-12 rounded-full bg-success-light flex items-center justify-center mb-6">
        <CheckCircle2 className="w-6 h-6 text-success-foreground" />
      </div>
      <h1 className="text-2xl font-semibold text-foreground mb-2">Password changed</h1>
      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
        Your password has been updated successfully. You can now sign in with your new password.
      </p>
      <div className="flex items-start gap-3 px-4 py-3.5 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/15 mb-6">
        <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-foreground leading-relaxed">
          A confirmation has been sent to <strong className="font-semibold">sarah.chen@example.com</strong>.
        </p>
      </div>
      <Button onClick={() => onNavigate("student-dashboard")} className="w-full">
        Continue to dashboard
      </Button>
      <p className="text-xs text-muted-foreground text-center mt-5">
        Didn't make this change?{" "}
        <a href="#" className="text-primary hover:underline font-semibold">
          Contact support
        </a>
      </p>
    </AuthLayout>
  );
}
