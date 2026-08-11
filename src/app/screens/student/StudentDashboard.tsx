import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Play,
  CheckCircle2,
  Circle,
  TrendingUp,
  Shield,
  CreditCard,
  Receipt,
  Download,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { BadgeVariant } from "../../../data/types";
import { StudentLayout } from "../../components/StudentNav";
import { Button, cn } from "../../components/Button";
import { Badge } from "../../components/Badge";
import { SupportCard } from "../../components/SupportCard";
import { useAuth } from "../../../hooks/useAuth";

const COURSE_IMG_WIDE = "https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?w=1200&h=500&fit=crop&auto=format";

interface EnrolledCourse {
  id: string;
  title: string;
  description: string | null;
  status: string;
  price: number;
  created_at: string;
}

interface CourseProgress {
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}

function CircularProgress({
  value,
  size = 80,
  strokeWidth = 7,
  className,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, Math.max(0, value)) / 100) * circ;
  return (
    <svg width={size} height={size} className={cn("transform -rotate-90", className)}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-white/20" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={strokeWidth} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="stroke-white transition-all duration-700 ease-out" />
    </svg>
  );
}

export function StudentDashboard() {
  const navigate = useNavigate();
  const { data: user } = useAuth();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [progress, setProgress] = useState<CourseProgress>({ completedLessons: 0, totalLessons: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Load enrolled courses
        const coursesRes = await fetch("/api/student/courses", { credentials: "include" });
        if (!coursesRes.ok) throw new Error("Failed to load enrolled courses");
        const enrolledCourses: EnrolledCourse[] = await coursesRes.json();
        setCourses(enrolledCourses);

        // Load progress for primary (first) course
        if (enrolledCourses.length > 0) {
          const primaryCourse = enrolledCourses[0];
          try {
            const progRes = await fetch(`/api/student/courses/${primaryCourse.id}/progress`, { credentials: "include" });
            if (progRes.ok) {
              const prog: CourseProgress = await progRes.json();
              setProgress(prog);
            }
          } catch {
            // Progress fetch is best-effort
          }
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const primaryCourse = courses[0] ?? null;
  const { completedLessons, totalLessons, percentage: pct } = progress;
  const remaining = Math.max(0, totalLessons - completedLessons);

  function handleOpenCourse(id: string, screen: "course-player" | "student-course-detail") {
    if (screen === "course-player") {
      navigate({ to: "/student/course", search: { id } as never });
    } else {
      navigate({ to: "/student/courses" });
    }
  }

  const wCard = "bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-200";
  const wHead = "text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest";

  return (
    <StudentLayout>
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground">No enrolled courses</h3>
            <p className="text-sm text-muted-foreground mt-1">Enroll in a course to start learning.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Hero Card */}
            <div className="relative overflow-hidden rounded-2xl shadow-xl bg-slate-900">
              <img
                src={COURSE_IMG_WIDE}
                alt={primaryCourse?.title || "Course"}
                className="absolute inset-0 w-full h-full object-cover opacity-[0.18] select-none pointer-events-none"
              />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#0F172A_0%,#1E293B_45%,#5C2410_100%)] pointer-events-none" />
              <div className="relative p-6 sm:p-8 flex gap-6 items-start">
                <div className="flex-1 min-w-0">
                  <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.12em] mb-2">Welcome back</p>
                  <h1 className="text-[22px] font-extrabold text-white leading-none mb-1 tracking-tight">
                    {user?.name || "Student"} <span className="font-normal">👋</span>
                  </h1>
                  <p className="text-white/60 text-sm mb-6">Continue your learning journey.</p>

                  <div className="mb-6 space-y-1">
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Current course</p>
                    <p className="text-white font-bold text-[15px] leading-snug">{primaryCourse?.title}</p>
                  </div>

                  {pct > 0 && (
                    <div className="flex items-center gap-2 mb-6 px-3 py-2.5 bg-white/[0.08] rounded-xl border border-white/10 w-fit max-w-full">
                      <Clock className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-white/90 text-xs font-semibold truncate">Continue Learning</p>
                        <p className="text-white/50 text-[10px]">{completedLessons} of {totalLessons} lessons done</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={() => handleOpenCourse(primaryCourse.id, "course-player")}
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg hover:bg-primary-hover active:scale-[0.98] transition-all duration-150 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" /> {pct > 0 ? "Continue Learning" : "Start Learning"}
                    </button>
                    <button
                      onClick={() => handleOpenCourse(primaryCourse.id, "student-course-detail")}
                      className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold text-sm px-4 py-2.5 rounded-xl border border-white/15 hover:bg-white/20 active:scale-[0.98] transition-all duration-150 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> View Course
                    </button>
                  </div>
                </div>

                <div className="hidden sm:flex flex-col items-center gap-2 flex-shrink-0">
                  <div className="relative w-[88px] h-[88px]">
                    <CircularProgress value={pct} size={88} strokeWidth={7} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-extrabold text-[17px] leading-none">{pct}%</span>
                    </div>
                  </div>
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Progress</p>
                </div>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[
                { label: "Completed", value: completedLessons, sub: "Lessons done", Icon: CheckCircle2, ic: "text-success-foreground", bg: "bg-success-light" },
                { label: "Remaining", value: remaining, sub: "Lessons left", Icon: Circle, ic: "text-warning-foreground", bg: "bg-warning-light" },
                { label: "Progress", value: `${pct}%`, sub: "Overall", Icon: TrendingUp, ic: "text-info-foreground", bg: "bg-info-light" },
              ].map(({ label, value, sub, Icon, ic, bg }) => (
                <div key={label} className={cn(wCard, "p-4 sm:p-5")}>
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", bg)}>
                    <Icon className={cn("w-4 h-4", ic)} />
                  </div>
                  <p className="text-[22px] font-extrabold text-foreground leading-none tabular-nums">{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{sub}</p>
                  <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Resume Learning */}
            {pct > 0 && (
              <div className={cn(wCard, "p-5 sm:p-6")}>
                <p className={cn(wHead, "mb-4")}>Resume Learning</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center flex-shrink-0">
                      <Play className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-foreground leading-tight">{primaryCourse?.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {completedLessons} of {totalLessons} lessons completed
                      </p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleOpenCourse(primaryCourse.id, "course-player")}>
                    <Play className="w-3.5 h-3.5" /> Resume
                  </Button>
                </div>
              </div>
            )}

            {/* Access & Payment Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={cn(wCard, "p-4 flex items-center gap-3")}>
                <div className="w-9 h-9 rounded-xl bg-success-light flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-success-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Course Access</p>
                  <p className="text-sm font-bold text-foreground">Active</p>
                  <p className="text-xs text-muted-foreground">Since {new Date(primaryCourse?.created_at || Date.now()).toLocaleDateString("en-IN")}</p>
                </div>
                <Badge variant="access-granted" />
              </div>
              <div className={cn(wCard, "p-4 flex items-center gap-3")}>
                <div className="w-9 h-9 rounded-xl bg-success-light flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-4 h-4 text-success-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Payment</p>
                  <p className="text-sm font-bold text-foreground">₹{(primaryCourse?.price || 0).toLocaleString("en-IN")}</p>
                </div>
                <Badge variant="paid" />
              </div>
            </div>

            <SupportCard />
          </div>
        )}
      </main>
    </StudentLayout>
  );
}
