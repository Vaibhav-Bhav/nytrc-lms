import { BookOpen, Upload } from "lucide-react";
import { Screen } from "../../../data/types";
import { AdminLayout } from "../../components/AdminLayout";
import { EmptyState } from "../../components/EmptyState";

export function EmptyAdminContent({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <AdminLayout>
      <main className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={BookOpen}
          title="No lessons yet"
          description="Upload your first lesson to get started. Videos and PDFs are both supported."
          action={{ label: "Upload first lesson", onClick: () => onNavigate?.("admin-content"), icon: Upload }}
        />
      </main>
    </AdminLayout>
  );
}
