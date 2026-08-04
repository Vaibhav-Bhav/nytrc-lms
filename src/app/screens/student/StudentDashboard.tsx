import { useEffect, useState } from "react";
import { BookOpen, Play, CheckCircle2, Circle, TrendingUp, Shield, CreditCard, Receipt, Download, Clock } from "lucide-react";
import { toast } from "sonner";
import { Screen, Course } from "../../../data/types";
import { lmsService } from "../../../services/lmsService";
import { StudentNav } from "../../components/StudentNav";
import { Button } from "../../components/Button";
import { ProgressBar } from "../../components/ProgressBar";
import { Badge } from "../../components/Badge";
import { SupportCard } from "../../components/SupportCard";

export function StudentDashboard({
  onNavigate,
  onSelectCourse,
}: {
  onNavigate: (s: Screen) => void;
  onSelectCourse?: (id: string) => void;
}) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await lmsService.getCourses();
      setCourses(data);
      setLoading(false);
    }
    loadData();
  }, []);

  // Filter courses visible to students: published courses or all courses for prototype demo
  const visibleCourses = courses.filter((c) => c.status === "published" || true);

  function handleOpenCourse(id: string, screen: "course-player" | "student-course-detail") {
    if (onSelectCourse) {
      onSelectCourse(id);
    }
    onNavigate(screen);
  }

  const primaryCourse = visibleCourses[0];
  const completedLessons = 9;
  const totalLessons = primaryCourse?.lessonCount || 15;
  const pct = Math.round((completedLessons / totalLessons) * 100);
  const remaining = totalLessons - completedLessons;

  return (
    <div className="flex-1 flex flex-col">
      <StudentNav current="student-dashboard" onNavigate={onNavigate} />
      <main className="flex-1 p-4 sm:p-6 max-w-3xl mx-auto w-full">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Good morning, Sarah.</h1>
          <p className="text-muted-foreground mt-1 text-sm">Pick up where you left off.</p>
        </div>

        {/* Enrolled Courses */}
        {loading ? (
          <div className="bg-card rounded-xl border border-border shadow-sm p-6 mb-5 animate-pulse">
            <div className="h-6 bg-muted rounded w-1/3 mb-4" />
            <div className="h-4 bg-muted rounded w-2/3 mb-2" />
          </div>
        ) : visibleCourses.length === 0 ? (
          <div className="bg-card rounded-xl border border-border shadow-sm p-8 text-center mb-5">
            <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground">No published courses available</h3>
            <p className="text-sm text-muted-foreground mt-1">Publish a course in the Admin panel to view it here.</p>
          </div>
        ) : (
          <div className="space-y-4 mb-5">
            {visibleCourses.map((courseItem) => {
              const courseTotal = courseItem.lessonCount || 15;
              const coursePct = courseItem.id === "c1" ? pct : 0;

              return (
                <div key={courseItem.id} className="bg-card rounded-xl border border-border shadow-sm p-5 sm:p-6">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Enrolled course
                        </span>
                        <Badge variant={courseItem.status} />
                      </div>
                      <h2 className="text-sm sm:text-base font-semibold text-foreground leading-snug">{courseItem.title}</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">{courseItem.instructor}</p>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2 hidden sm:block">
                        {courseItem.description}
                      </p>
                    </div>
                  </div>
                  <div className="mb-5">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        {coursePct > 0 ? `${completedLessons} of ${courseTotal}` : `0 of ${courseTotal}`} lessons complete
                      </span>
                      <span className="font-semibold text-foreground">{coursePct}%</span>
                    </div>
                    <ProgressBar value={coursePct} color="primary" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={() => handleOpenCourse(courseItem.id, "course-player")} className="w-full sm:w-auto">
                      <Play className="w-3.5 h-3.5" />
                      {coursePct > 0 ? "Continue learning" : "Start learning"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleOpenCourse(courseItem.id, "student-course-detail")}
                      className="w-full sm:w-auto"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      View course
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Last viewed lesson card */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-5 mb-4 sm:mb-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                <Play className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Last viewed</p>
                <p className="text-sm font-semibold text-foreground truncate">Prototypes & Classes</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">Advanced Topics</span>
                  <span className="text-muted-foreground/30 text-xs">·</span>
                  <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                    <Clock className="w-3 h-3" />
                    Resume from 11:28
                  </span>
                </div>
              </div>
            </div>
            <Button size="sm" onClick={() => onNavigate("course-player")} className="flex-shrink-0">
              <Play className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Resume</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5">
          {[
            {
              label: "Completed",
              value: completedLessons,
              icon: CheckCircle2,
              ic: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-50 dark:bg-emerald-900/20",
            },
            {
              label: "Remaining",
              value: remaining,
              icon: Circle,
              ic: "text-amber-600 dark:text-amber-400",
              bg: "bg-amber-50 dark:bg-amber-900/20",
            },
            { label: "Progress", value: `${pct}%`, icon: TrendingUp, ic: "text-primary", bg: "bg-primary/10" },
          ].map(({ label, value, icon: Icon, ic, bg }) => (
            <div key={label} className="bg-card rounded-xl border border-border shadow-sm p-3 sm:p-4">
              <div className={`w-7 sm:w-8 h-7 sm:h-8 rounded-lg flex items-center justify-center mb-2 sm:mb-3 ${bg}`}>
                <Icon className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${ic}`} />
              </div>
              <p className="text-lg sm:text-xl font-semibold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Access + Payment status row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 sm:mb-5">
          <div className="bg-card rounded-xl border border-border shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Course Access</p>
              <p className="text-sm font-semibold text-foreground">Active</p>
              <p className="text-xs text-muted-foreground">Since 2024-11-03</p>
            </div>
            <Badge variant="access-granted" />
          </div>
          <div className="bg-card rounded-xl border border-border shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Payment</p>
              <p className="text-sm font-semibold text-foreground">₹14,750</p>
              <p className="text-xs text-muted-foreground">2024-11-03</p>
            </div>
            <Badge variant="paid" />
          </div>
        </div>

        {/* Invoice availability */}
        <div className="bg-card rounded-xl border border-border shadow-sm px-4 sm:px-5 py-3.5 mb-4 sm:mb-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Receipt className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Invoice available</p>
                <p className="text-xs text-muted-foreground">INV-2024-001 · ₹14,750</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => toast.success("Invoice downloaded")}>
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </div>
        </div>

        <SupportCard />
      </main>
    </div>
  );
}
