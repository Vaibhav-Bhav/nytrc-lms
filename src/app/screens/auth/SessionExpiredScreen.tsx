import { Clock, Info } from "lucide-react";
import { Screen } from "../../../data/types";
import { AuthLayout } from "../../components/AuthLayout";
import { Button } from "../../components/Button";

export function SessionExpiredScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <AuthLayout>
      <div className="w-12 h-12 rounded-full bg-warning-light flex items-center justify-center mb-6">
        <Clock className="w-6 h-6 text-warning-foreground" />
      </div>
      <h1 className="text-2xl font-semibold text-foreground mb-2">Session expired</h1>
      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
        Your session has timed out due to inactivity. Please sign in again to continue where you left off.
      </p>
      <div className="flex items-start gap-3 px-4 py-3.5 bg-warning-light rounded-xl border border-warning/20 mb-6">
        <Info className="w-4 h-4 text-warning-foreground flex-shrink-0 mt-0.5" />
        <p className="text-sm text-warning-foreground leading-relaxed font-medium">
          Your progress is saved. You won't lose any completed lessons.
        </p>
      </div>
      <Button onClick={() => onNavigate("login")} className="w-full">
        Sign in again
      </Button>
      <p className="text-xs text-muted-foreground text-center mt-5">
        Need help? <a href="#" className="text-primary hover:underline">support@nytrc.org</a>
      </p>
    </AuthLayout>
  );
}
