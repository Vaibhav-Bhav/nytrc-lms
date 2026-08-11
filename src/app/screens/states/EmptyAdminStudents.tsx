import { Users } from "lucide-react";
import { Screen } from "../../../data/types";
import { AdminLayout } from "../../components/AdminLayout";
import { EmptyState } from "../../components/EmptyState";

export function EmptyAdminStudents({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <AdminLayout>
      <main className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={Users}
          title="No students yet"
          description="Student records will appear here once the first enrolment is processed through the payment flow."
        />
      </main>
    </AdminLayout>
  );
}
