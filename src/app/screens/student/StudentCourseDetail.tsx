import { useState, useEffect } from "react";
import {
  BookOpen,
  Play,
  Clock,
  Check,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  FileText,
  Circle,
  Loader2,
} from "lucide-react";
import { Screen } from "../../../data/types";
import { StudentLayout } from "../../components/StudentNav";
import { Breadcrumb } from "../../components/Breadcrumb";
import { ProgressBar } from "../../components/ProgressBar";
import { Button, cn } from "../../components/Button";
import { toast } from "sonner";
import { useAuth } from "../../../hooks/useAuth";

const COURSE_IMG = "https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?w=900&h=500&fit=crop&auto=format";

interface ApiLesson {
  id: string;
  section_id: string;
  title: string;
  description: string | null;
  lesson_order: number;
  hasVideo: boolean;
  hasDocument: boolean;
  allow_download: boolean;
  page_count: number | null;
}

interface ApiSection {
  id: string;
  course_id: string;
  title: string;
  order_number: number;
  lessons: ApiLesson[];
}

interface ApiCourse {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  status: string;
  price: number;
}

interface CourseDetailResponse {
  course: ApiCourse;
  sections: ApiSection[];
}

interface CourseProgress {
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}

export function StudentCourseDetail({
  onNavigate,
  selectedCourseId,
}: {
  onNavigate?: (s: Screen, params?: { courseId?: string, lessonId?: string }) => void;
  selectedCourseId?: string;
}) {
  const { data: user } = useAuth();
  const [course, setCourse] = useState<ApiCourse | null>(null);
  const [sections, setSections] = useState<ApiSection[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<CourseProgress>({ completedLessons: 0, totalLessons: 0, percentage: 0 });
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState<string | null>(selectedCourseId || null);

  useEffect(() => {
    async function loadCourseDetail() {
      setLoading(true);
      try {
        // If no specific course ID, get first enrolled course
        let targetId = selectedCourseId;
        if (!targetId) {
          const listRes = await fetch("/api/student/courses", { credentials: "include" });
          if (listRes.ok) {
            const list: ApiCourse[] = await listRes.json();
            targetId = list[0]?.id;
          }
        }

        if (!targetId) {
          setLoading(false);
          return;
        }

        setCourseId(targetId);

        const [detailRes, progRes] = await Promise.all([
          fetch(`/api/student/courses/${targetId}`, { credentials: "include" }),
          fetch(`/api/student/courses/${targetId}/progress`, { credentials: "include" }),
        ]);

        if (!detailRes.ok) throw new Error("Failed to load course detail");
        const detail: CourseDetailResponse = await detailRes.json();
        setCourse(detail.course);
        setSections(detail.sections);
        setExpandedSections(new Set(detail.sections.map((s) => s.id)));

        if (progRes.ok) {
          const prog: CourseProgress = await progRes.json();
          setProgress(prog);
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to load course");
      } finally {
        setLoading(false);
      }
    }
    loadCourseDetail();
  }, [selectedCourseId]);

  const allLessons = sections.flatMap((s) => s.lessons || []);
  const { completedLessons: completedLessonsCount, totalLessons: totalLessonsCount, percentage: pct } = progress;

  function toggleSection(id: string) {
    setExpandedSections((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  async function handleMarkComplete(lesson: ApiLesson) {
    if (completedIds.has(lesson.id)) return;
    try {
      const res = await fetch("/api/student/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lessonId: lesson.id, completed: true }),
      });
      if (res.ok) {
        setCompletedIds((prev) => new Set([...prev, lesson.id]));
        setProgress((prev) => ({
          ...prev,
          completedLessons: prev.completedLessons + 1,
          percentage: Math.round(((prev.completedLessons + 1) / Math.max(prev.totalLessons, 1)) * 100),
        }));
      }
    } catch {
      // best effort
    }
  }

  return (
    <StudentLayout>
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-4">
          <Breadcrumb
            items={[
              { label: "Dashboard", onClick: () => onNavigate?.("student-dashboard") },
              { label: course?.title || "Course Detail" },
            ]}
          />
        </div>

        {/* Course header */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mb-6">
          <div className="relative h-44 sm:h-52 bg-slate-900 overflow-hidden">
            <img
              src={course?.thumbnail_url || COURSE_IMG}
              alt={course?.title || "Course"}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
              <h1 className="text-white font-extrabold text-lg sm:text-2xl leading-snug drop-shadow-md">
                {loading ? "Loading..." : course?.title}
              </h1>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <p className="text-sm text-muted-foreground leading-relaxed">{course?.description}</p>

            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className="text-muted-foreground">
                  {completedLessonsCount} of {totalLessonsCount || allLessons.length} lessons complete
                </span>
                <span className="font-bold text-foreground">{pct}%</span>
              </div>
              <ProgressBar value={pct} color="primary" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                onClick={() => {
                  const firstUncompleted = allLessons.find(l => !completedIds.has(l.id));
                  const targetLessonId = firstUncompleted ? firstUncompleted.id : allLessons[0]?.id;
                  onNavigate?.("course-player", { courseId: course?.id, lessonId: targetLessonId });
                }}
                className="flex-1 sm:flex-none"
                disabled={loading || allLessons.length === 0}
              >
                <Play className="w-4 h-4" />
                {pct > 0 ? "Resume course" : "Start course"}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          {[
            { label: "Sections", value: sections.length },
            { label: "Lessons", value: totalLessonsCount || allLessons.length },
            { label: "Completed", value: completedLessonsCount },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card rounded-2xl border border-border shadow-sm p-4 text-center">
              <p className="text-xl sm:text-2xl font-extrabold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Sections + lessons */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-muted/20">
            <h2 className="font-bold text-foreground text-base">Course Content</h2>
          </div>

          {loading ? (
            <div className="p-8 flex items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading course sections...</span>
            </div>
          ) : sections.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No sections created for this course yet.
            </div>
          ) : (
            sections.map((section, si) => {
              const expanded = expandedSections.has(section.id);
              const lessons = section.lessons || [];
              const doneCount = lessons.filter((l) => completedIds.has(l.id)).length;
              const allDone = lessons.length > 0 && doneCount === lessons.length;

              return (
                <div key={section.id} className="border-t border-border first:border-0">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/20 transition-colors text-left cursor-pointer"
                  >
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors",
                        allDone ? "border-success bg-success text-white" : "border-border text-muted-foreground"
                      )}
                    >
                      {allDone ? <Check className="w-3.5 h-3.5" /> : si + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">{section.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {lessons.length} lessons · {doneCount} completed
                      </p>
                    </div>
                    {expanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>

                  {expanded && (
                    <div className="border-t border-border/60 bg-muted/10">
                      {lessons.map((lesson) => {
                        const isDone = completedIds.has(lesson.id);
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => onNavigate?.("course-player", { courseId: course?.id, lessonId: lesson.id })}
                            className="w-full flex items-center gap-3 pl-12 pr-5 py-3 border-t border-border/40 text-left hover:bg-muted/30 transition-colors cursor-pointer"
                          >
                            <div className="flex-shrink-0">
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-success-foreground" />
                              ) : lesson.hasVideo ? (
                                <Circle className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <FileText className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-sm truncate font-medium", isDone ? "text-muted-foreground line-through" : "text-foreground")}>
                                {lesson.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                {lesson.hasVideo ? (
                                  <><Clock className="w-3 h-3" /> Video lesson</>
                                ) : (
                                  <><FileText className="w-3 h-3" /> PDF resource{lesson.allow_download ? " · Download allowed" : ""}</>
                                )}
                              </p>
                            </div>
                            {!isDone && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleMarkComplete(lesson); }}
                                className="text-xs text-primary font-semibold hover:underline flex-shrink-0 cursor-pointer px-1"
                              >
                                Mark done
                              </button>
                            )}
                            {isDone && (
                              <span className="text-xs bg-success-light text-success-foreground px-2 py-0.5 rounded font-bold flex-shrink-0">
                                Done
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </StudentLayout>
  );
}
