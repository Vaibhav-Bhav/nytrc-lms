import { WifiOff, RefreshCw, Mail } from "lucide-react";
import { Screen } from "../../../data/types";
import { StudentNav } from "../../components/StudentNav";
import { Button } from "../../components/Button";

export function ErrorContentScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="flex-1 flex flex-col">
      <StudentNav current="student-dashboard" onNavigate={onNavigate} />
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-5">
          <WifiOff className="w-8 h-8 text-red-500 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Failed to load</h2>
        <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-6">
          We couldn't reach the server. Check your connection and try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => onNavigate("student-dashboard")}>
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
          <Button variant="secondary">
            <Mail className="w-4 h-4" />
            Contact support
          </Button>
        </div>
      </main>
    </div>
  );
}
