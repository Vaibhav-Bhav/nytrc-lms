import { useEffect, useState } from "react";
import { Plus, BookOpen, Users, TrendingUp, Pencil, Trash2, ChevronRight, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Screen, Course, Student } from "../../../data/types";
import { lmsService } from "../../../services/lmsService";
import { AdminLayout } from "../../components/AdminLayout";
import { Button, cn } from "../../components/Button";
import { Badge } from "../../components/Badge";
import { ProgressBar } from "../../components/ProgressBar";
import { ConfirmModal } from "../../components/ConfirmDialog";

export function AdminDashboard({
  onNavigate,
  onSelectCourse,
}: {
  onNavigate: (s: Screen) => void;
  onSelectCourse?: (id: string) => void;
}) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const [fetchedCourses, fetchedStudents] = await Promise.all([
        lmsService.getCourses(),
        lmsService.getStudents(),
      ]);
      if (isMounted) {
        setCourses(fetchedCourses);
        setStudents(fetchedStudents);
        setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleDeleteCourse() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await lmsService.deleteCourse(deleteTarget.id);
      setCourses((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteLoading(false);
      setDeleteTarget(null);
      toast.success("Course deleted successfully");
    } catch (err: any) {
      setDeleteLoading(false);
      toast.error(err.message || "Failed to delete course");
    }
  }

  function handleEditCourse(id: string) {
    onSelectCourse?.(id);
    onNavigate("admin-content");
  }

  const activeCount = students.filter((s) => new Date(s.lastLogin) >= new Date("2024-11-28")).length;

  return (
    <AdminLayout current="admin-dashboard" onNavigate={onNavigate}>
      <main className="flex-1 p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Platform overview.</p>
          </div>
          <Button onClick={() => onNavigate("admin-create-course")} className="self-start flex-shrink-0">
            <Plus className="w-4 h-4" />
            Create course
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
          {[
            {
              label: "Total courses",
              value: courses.length,
              Icon: BookOpen,
              ic: "text-indigo-600 dark:text-indigo-400",
              bg: "bg-indigo-50 dark:bg-indigo-900/20",
            },
            {
              label: "Total enrolments",
              value: students.length,
              Icon: Users,
              ic: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Active learners — 30 days",
              value: activeCount,
              Icon: TrendingUp,
              ic: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-50 dark:bg-emerald-900/20",
            },
          ].map(({ label, value, Icon, ic, bg }) => (
            <div key={label} className="bg-card rounded-xl border border-border shadow-sm p-5 sm:p-6">
              <div className={cn("w-9 sm:w-10 h-9 sm:h-10 rounded-lg flex items-center justify-center mb-3 sm:mb-4", bg)}>
                <Icon className={cn("w-4 sm:w-5 h-4 sm:h-5", ic)} />
              </div>
              <p className="text-2xl sm:text-3xl font-semibold text-foreground">{loading ? "..." : value}</p>
              <p className="text-sm text-muted-foreground mt-1 leading-snug">{label}</p>
            </div>
          ))}
        </div>

        {/* Courses list */}
        <div className="bg-card rounded-xl border border-border shadow-sm mb-6">
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Courses ({courses.length})</h2>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("admin-create-course")}>
              <Plus className="w-4 h-4" />
              New course
            </Button>
          </div>
          {courses.length === 0 ? (
            <div className="p-8 text-center border-b border-border">
              <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No courses available. Click "Create course" to add one.</p>
            </div>
          ) : (
            courses.map((course, i) => (
              <div
                key={course.id}
                className={cn(
                  "flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-4 hover:bg-muted/20 transition-colors",
                  i > 0 && "border-t border-border"
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{course.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {course.instructor} · {course.sectionCount ?? 0} sections · {course.lessonCount ?? 0} lessons
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <Badge variant={course.status} />
                  <Button variant="ghost" size="sm" onClick={() => handleEditCourse(course.id)}>
                    <Pencil className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <button
                    onClick={() => setDeleteTarget(course)}
                    title="Delete course"
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent students */}
        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Recent students</h2>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("admin-students")}>
              View all
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          {students.slice(0, 5).map((student, i) => (
            <div
              key={student.id}
              className={cn(
                "flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-3 hover:bg-muted/20 transition-colors",
                i > 0 && "border-t border-border"
              )}
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-muted-foreground">
                  {student.name.split(" ").map((n) => n[0]).join("")}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{student.name}</p>
                <p className="text-xs text-muted-foreground truncate hidden sm:block">{student.email}</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <div className="w-16 sm:w-24 hidden sm:block">
                  <ProgressBar value={student.progress} color={student.progress >= 75 ? "green" : "primary"} />
                </div>
                <span className="text-xs font-semibold text-muted-foreground w-8 text-right">{student.progress}%</span>
                <Badge variant={student.status} />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Delete Course Confirm Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteCourse}
        loading={deleteLoading}
        title="Delete course"
        description={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        warning="This will permanently remove the course and all associated sections, lessons, and media files from both Admin and Student portals. This action cannot be undone."
        confirmLabel="Delete Course"
        confirmVariant="destructive"
        icon={AlertTriangle}
      />
    </AdminLayout>
  );
}
