import { BookOpen, Mail } from "lucide-react";
import { Screen } from "../../../data/types";
import { StudentLayout } from "../../components/StudentNav";
import { EmptyState } from "../../components/EmptyState";

export function EmptyStudentDashboard({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <StudentLayout current="student-dashboard" onNavigate={onNavigate}>
      <main className="flex-1 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <EmptyState
          icon={BookOpen}
          title="No course yet"
          description="You haven't been enrolled in a course yet. Once your enrolment is confirmed, it will appear here."
          action={{ label: "Contact support", onClick: () => {}, icon: Mail }}
        />
      </main>
    </StudentLayout>
  );
}
