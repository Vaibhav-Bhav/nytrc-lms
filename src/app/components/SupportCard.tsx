import { Mail } from "lucide-react";
import { cn } from "./Button";

export const SUPPORT_MESSAGES: Record<string, string> = {
  payment: "Having trouble with your payment? We can help you resolve billing issues and verify transactions.",
  login: "Can't sign in? We'll help you recover access to your account quickly.",
  access: "Not seeing your course? We can verify your enrollment and restore access.",
  upload: "Upload not completing? We can diagnose processing issues and help you re-upload.",
  invoice: "Need an invoice or receipt? We can generate and resend billing documents.",
};

export function SupportCard({ type, className }: { type?: keyof typeof SUPPORT_MESSAGES; className?: string }) {
  const message = (type && SUPPORT_MESSAGES[type]) || "Our support team is here to help with any questions you have.";
  return (
    <div className={cn("bg-card rounded-xl border border-border shadow-sm p-4 sm:p-5", className)}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Mail className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Need help?</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{message}</p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-3">
            <a
              href="mailto:support@learnbase.io"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
            >
              <Mail className="w-3.5 h-3.5" />
              support@learnbase.io
            </a>
            <span className="text-xs text-muted-foreground hidden sm:inline">·</span>
            <span className="text-xs text-muted-foreground">Replies within 2 hours on weekdays</span>
          </div>
        </div>
      </div>
    </div>
  );
}
