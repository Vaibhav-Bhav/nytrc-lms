import { Lock, ArrowLeft } from "lucide-react";
import { Screen } from "../../../data/types";
import { AuthLayout } from "../../components/AuthLayout";
import { Button } from "../../components/Button";
import { SupportCard } from "../../components/SupportCard";

export function AccountLockedScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <AuthLayout>
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-6">
        <Lock className="w-6 h-6 text-red-600 dark:text-red-400" />
      </div>
      <h1 className="text-2xl font-semibold text-foreground mb-2">Account locked</h1>
      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
        Your account has been temporarily locked after 5 failed sign-in attempts. This is to protect your account.
      </p>
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/40 px-4 py-4 mb-6">
        <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">What to do next</p>
        <ul className="text-sm text-red-700/80 dark:text-red-400/80 space-y-1 list-disc list-inside">
          <li>Wait 15 minutes and try again</li>
          <li>Use "Forgot password" to reset your credentials</li>
          <li>Contact support if you believe this is an error</li>
        </ul>
      </div>
      <div className="flex flex-col gap-3">
        <Button onClick={() => onNavigate?.("forgot-password")} className="w-full">
          Reset my password
        </Button>
        <Button variant="secondary" className="w-full" onClick={() => onNavigate?.("login")}>
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Button>
      </div>
      <SupportCard type="login" className="mt-5" />
    </AuthLayout>
  );
}
