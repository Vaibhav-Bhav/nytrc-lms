import { Screen } from "../../../data/types";
import { StudentLayout } from "../../components/StudentNav";
import { AdminLayout } from "../../components/AdminLayout";
import { Skel, LoadingSpinner } from "../../components/LoadingSkeleton";

export function SkeletonDashboard({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <StudentLayout current="student-dashboard" onNavigate={onNavigate}>
      <main className="flex-1 p-4 sm:p-6 max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <Skel className="h-7 w-52 mb-2" />
          <Skel className="h-4 w-36" />
        </div>
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 sm:p-6 mb-5">
          <div className="flex items-start gap-4 mb-5">
            <Skel className="w-11 h-11 rounded-xl flex-shrink-0" />
            <div className="flex-1">
              <Skel className="h-3 w-24 mb-2.5" />
              <Skel className="h-5 w-full mb-1.5" />
              <Skel className="h-5 w-3/4 mb-1.5" />
            </div>
          </div>
          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <Skel className="h-4 w-44" />
              <Skel className="h-4 w-9" />
            </div>
            <Skel className="h-1.5 w-full" />
          </div>
          <Skel className="h-9 w-52 rounded-lg" />
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-border shadow-sm p-4">
              <Skel className="w-8 h-8 rounded-lg mb-3" />
              <Skel className="h-6 w-10 mb-1.5" />
              <Skel className="h-3 w-20" />
            </div>
          ))}
        </div>
        <Skel className="h-16 rounded-xl" />
      </main>
    </StudentLayout>
  );
}

export function SkeletonPlayer({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <StudentLayout current="course-player" onNavigate={onNavigate}>
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-[calc(100vh-64px)]">
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <div className="bg-slate-900 relative" style={{ paddingBottom: "56.25%" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <LoadingSpinner size="lg" className="text-white/20" />
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <div className="flex gap-6 pb-3 border-b border-border mb-5">
              <Skel className="h-5 w-20" />
              <Skel className="h-5 w-32" />
            </div>
            <Skel className="h-5 w-52 mb-4" />
            <Skel className="h-4 w-full mb-2" />
            <Skel className="h-4 w-5/6 mb-2" />
            <Skel className="h-4 w-4/6" />
          </div>
        </div>
        <div className="hidden lg:flex w-72 border-l border-border bg-card flex-col flex-shrink-0">
          <div className="px-4 py-3 border-b border-border">
            <Skel className="h-4 w-32" />
          </div>
          <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skel className="h-12 rounded-lg mb-1" />
                {i <= 2 && [1, 2, 3].map((j) => <Skel key={j} className="h-9 rounded-lg ml-4 mb-1" />)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

export function SkeletonAdminTable({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <AdminLayout current="admin-students" onNavigate={onNavigate}>
      <main className="flex-1 p-4 sm:p-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <Skel className="h-7 w-28 mb-2" />
            <Skel className="h-4 w-20" />
          </div>
          <Skel className="h-9 w-32 rounded-lg" />
        </div>
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border">
            <Skel className="h-9 w-full" />
          </div>
          <div className="px-5 py-3 border-b border-border bg-muted/20 flex gap-6">
            {[100, 140, 90, 80, 80, 56].map((w, i) => (
              <Skel key={i} className="h-3 flex-shrink-0" style={{ width: w }} />
            ))}
          </div>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-t border-border">
              <Skel className="w-8 h-8 rounded-full flex-shrink-0" />
              <Skel className="h-4 w-28 flex-shrink-0" />
              <Skel className="h-4 flex-1 max-w-[160px] hidden sm:block" />
              <Skel className="h-4 w-20 ml-auto flex-shrink-0 hidden md:block" />
              <Skel className="h-3 w-20 flex-shrink-0 hidden lg:block" />
              <Skel className="h-5 w-14 rounded-md flex-shrink-0" />
            </div>
          ))}
        </div>
      </main>
    </AdminLayout>
  );
}
