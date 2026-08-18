import { useEffect, useState } from "react";
import {
  Plus,
  BookOpen,
  Users,
  TrendingUp,
  Pencil,
  Trash2,
  ChevronRight,
  CreditCard,
  BarChart2,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { Course, Student } from "../../../data/types";
import { PAYMENT_HISTORY } from "../../../data/mockData";
import { lmsService } from "../../../services/lmsService";
import { AdminLayout } from "../../components/AdminLayout";
import { Button, cn } from "../../components/Button";
import { Badge } from "../../components/Badge";
import { ProgressBar } from "../../components/ProgressBar";
import { ConfirmDialog } from "../../components/ConfirmDialog";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [fetchedCourses, studentsRes] = await Promise.all([
          lmsService.getCourses(),
          fetch('/api/admin/students'),
        ]);

        let fetchedStudents = [];
        if (studentsRes.ok) {
          fetchedStudents = await studentsRes.json();
        }

        if (isMounted) {
          setCourses(fetchedCourses);
          setStudents(fetchedStudents);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        if (isMounted) setLoading(false);
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
    navigate({ to: "/admin/content", search: { courseId: id } as never });
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const activeCount = students.filter((s) => s.lastLogin && new Date(s.lastLogin) >= thirtyDaysAgo).length;
  const avgProgress = students.length > 0 ? Math.round(students.reduce((sum, s) => sum + (s.progress || 0), 0) / students.length) : 0;
  const revenue = PAYMENT_HISTORY.filter((p) => p.status === "paid").length * 14750;

  const aCard = "bg-card rounded-2xl border border-border shadow-sm overflow-hidden";
  const aHead = "flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20";

  return (
    <AdminLayout>
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-1">Platform overview · LMS Admin Portal</p>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: "Total students",
                value: students.length,
                trend: "+2 this week",
                Icon: Users,
                ic: "text-primary",
                bg: "bg-primary-light",
              },
              {
                label: "Active learners",
                value: activeCount,
                trend: "last 30 days",
                Icon: TrendingUp,
                ic: "text-success-foreground",
                bg: "bg-success-light",
              },
              {
                label: "Revenue",
                value: `₹${(revenue / 1000).toFixed(0)}k`,
                trend: "total collected",
                Icon: CreditCard,
                ic: "text-warning-foreground",
                bg: "bg-warning-light",
              },
              {
                label: "Avg progress",
                value: `${avgProgress}%`,
                trend: "all students",
                Icon: BarChart2,
                ic: "text-info-foreground",
                bg: "bg-info-light",
              },
            ].map(({ label, value, trend, Icon, ic, bg }) => (
              <div
                key={label}
                className="bg-card rounded-2xl border border-border shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", bg)}>
                    <Icon className={cn("w-5 h-5", ic)} />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide text-right leading-tight mt-0.5">
                    {trend}
                  </span>
                </div>
                <p className="text-[26px] font-extrabold text-foreground leading-none tabular-nums mt-auto">
                  {loading ? "..." : value}
                </p>
                <p className="text-xs font-medium text-muted-foreground mt-1.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Two-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Courses */}
            <div className={aCard}>
              <div className={aHead}>
                <h2 className="font-bold text-foreground text-sm">Courses ({courses.length})</h2>
              </div>
              {courses.length === 0 ? (
                <div className="p-8 text-center border-b border-border">
                  <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No courses available. Go to Content Editor to create one.</p>
                </div>
              ) : (
                courses.map((course, i) => (
                  <div
                    key={course.id}
                    className={cn(
                      "flex items-center gap-3 px-5 py-4 hover:bg-muted/20 transition-colors",
                      i > 0 && "border-t border-border"
                    )}
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{course.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {course.instructor} · {course.sectionCount ?? 4} sections · {course.lessonCount ?? 15} lessons
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={course.status} />
                      <button
                        onClick={() => handleEditCourse(course.id)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                        title="Edit course"
                      >
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(course)}
                        title="Delete course"
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Recent payments */}
            <div className={aCard}>
              <div className={aHead}>
                <h2 className="font-bold text-foreground text-sm">Recent Payments</h2>
                <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/admin/payments" })}>
                  View all
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              {PAYMENT_HISTORY.map((p, i) => (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3.5 hover:bg-muted/20 transition-colors",
                    i > 0 && "border-t border-border"
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">SC</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">Sarah Chen</p>
                    <p className="text-xs text-muted-foreground">{p.date}</p>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className="text-sm font-bold text-foreground tabular-nums">{p.amount}</span>
                    <Badge variant={p.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent students table */}
          <div className={aCard}>
            <div className={aHead}>
              <h2 className="font-bold text-foreground text-sm">Recent Students</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/admin/students" })}>
                View all
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Student
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Progress
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">
                        Loading students...
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">
                        No students found.
                      </td>
                    </tr>
                  ) : (
                    students.slice(0, 5).map((student) => (
                      <tr
                        key={student.id}
                        className="hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => navigate({ to: `/admin/students/${student.id}` as never })}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-primary">
                                {student.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-foreground">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-muted-foreground hidden md:table-cell truncate max-w-[180px]">
                          {student.email}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-20">
                              <ProgressBar value={student.progress || 0} color={(student.progress || 0) >= 75 ? "green" : "primary"} />
                            </div>
                            <span className="text-xs font-bold text-muted-foreground tabular-nums">{student.progress || 0}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={student.status || "active"} />
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <ChevronRight className="w-4 h-4 text-muted-foreground inline" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Course Confirm Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteCourse}
        loading={deleteLoading}
        title="Delete Course?"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This will permanently remove the course and all associated sections, lessons, and media files.`}
        confirmText="Delete Course"
        variant="destructive"
      />
    </AdminLayout>
  );
}
