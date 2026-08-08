import { useEffect, useState } from "react";
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
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Screen, Course, BadgeVariant } from "../../../data/types";
import { lmsService } from "../../../services/lmsService";
import { StudentLayout } from "../../components/StudentNav";
import { Button, cn } from "../../components/Button";
import { ProgressBar } from "../../components/ProgressBar";
import { Badge } from "../../components/Badge";
import { SupportCard } from "../../components/SupportCard";

const COURSE_IMG_WIDE = "https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?w=1200&h=500&fit=crop&auto=format";

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
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-white/20"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={strokeWidth}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="stroke-white transition-all duration-700 ease-out"
      />
    </svg>
  );
}

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

  const wCard = "bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-200";
  const wHead = "text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest";

  return (
    <StudentLayout current="student-dashboard" onNavigate={onNavigate}>
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {loading ? (
          <div className="bg-card rounded-2xl border border-border p-8 text-center animate-pulse">
            <div className="h-6 bg-muted rounded w-1/3 mx-auto mb-4" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
          </div>
        ) : visibleCourses.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground">No published courses available</h3>
            <p className="text-sm text-muted-foreground mt-1">Publish a course in the Admin panel to view it here.</p>
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
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-primary/80 pointer-events-none" />
              <div className="relative p-6 sm:p-8 flex gap-6 items-start">
                <div className="flex-1 min-w-0">
                  <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.12em] mb-2">Welcome back</p>
                  <h1 className="text-[22px] font-extrabold text-white leading-none mb-1 tracking-tight">
                    Sarah Chen <span className="font-normal">👋</span>
                  </h1>
                  <p className="text-white/60 text-sm mb-6">Continue your learning journey.</p>

                  <div className="mb-6 space-y-1">
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Current course</p>
                    <p className="text-white font-bold text-[15px] leading-snug">{primaryCourse?.title}</p>
                    <p className="text-white/60 text-xs">{primaryCourse?.instructor}</p>
                  </div>

                  <div className="flex items-center gap-2 mb-6 px-3 py-2.5 bg-white/[0.08] rounded-xl border border-white/10 w-fit max-w-full">
                    <Clock className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-white/90 text-xs font-semibold truncate">Prototypes &amp; Classes</p>
                      <p className="text-white/50 text-[10px]">Paused at 11:28 · Advanced Topics</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={() => handleOpenCourse(primaryCourse.id, "course-player")}
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg hover:bg-primary-hover active:scale-[0.98] transition-all duration-150 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" /> Continue Learning
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
                {
                  label: "Completed",
                  value: completedLessons,
                  sub: "Lessons done",
                  Icon: CheckCircle2,
                  ic: "text-success-foreground",
                  bg: "bg-success-light",
                },
                {
                  label: "Remaining",
                  value: remaining,
                  sub: "Lessons left",
                  Icon: Circle,
                  ic: "text-warning-foreground",
                  bg: "bg-warning-light",
                },
                {
                  label: "Progress",
                  value: `${pct}%`,
                  sub: "Overall",
                  Icon: TrendingUp,
                  ic: "text-info-foreground",
                  bg: "bg-info-light",
                },
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

            {/* Resume Learning Card */}
            <div className={cn(wCard, "p-5 sm:p-6")}>
              <p className={cn(wHead, "mb-4")}>Resume Learning</p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center flex-shrink-0">
                    <Play className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-foreground leading-tight">Prototypes &amp; Classes</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Advanced Topics · Lesson 9</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] text-warning-foreground font-semibold bg-warning-light px-2 py-0.5 rounded-lg border border-warning/20">
                        <Clock className="w-3 h-3" /> Paused at 11:28
                      </span>
                      <span className="text-[11px] text-muted-foreground">~18 min lesson</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" onClick={() => handleOpenCourse(primaryCourse.id, "course-player")}>
                  <Play className="w-3.5 h-3.5" /> Resume
                </Button>
              </div>
            </div>

            {/* Access & Payment Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={cn(wCard, "p-4 flex items-center gap-3")}>
                <div className="w-9 h-9 rounded-xl bg-success-light flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-success-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Course Access</p>
                  <p className="text-sm font-bold text-foreground">Active</p>
                  <p className="text-xs text-muted-foreground">Since 2024-11-03</p>
                </div>
                <Badge variant="access-granted" />
              </div>
              <div className={cn(wCard, "p-4 flex items-center gap-3")}>
                <div className="w-9 h-9 rounded-xl bg-success-light flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-4 h-4 text-success-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Payment</p>
                  <p className="text-sm font-bold text-foreground">₹14,750</p>
                  <p className="text-xs text-muted-foreground">2024-11-03</p>
                </div>
                <Badge variant="paid" />
              </div>
            </div>

            {/* Invoice card */}
            <div className={cn(wCard, "px-5 py-4")}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Receipt className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">Invoice available</p>
                    <p className="text-xs text-muted-foreground">INV-2024-001 · ₹14,750</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => toast.success("Invoice downloaded")}>
                  <Download className="w-4 h-4" /> Download
                </Button>
              </div>
            </div>

            <SupportCard />
          </div>
        )}
      </main>
    </StudentLayout>
  );
}
