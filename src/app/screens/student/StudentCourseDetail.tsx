import { useState, useEffect } from "react";
import {
  BookOpen,
  Play,
  Clock,
  Check,
  ChevronUp,
  ChevronDown,
  Lock,
  EyeOff,
  CheckCircle2,
  FileText,
  Circle,
} from "lucide-react";
import { Screen, Course, Section } from "../../../data/types";
import { lmsService } from "../../../services/lmsService";
import { StudentLayout } from "../../components/StudentNav";
import { Breadcrumb } from "../../components/Breadcrumb";
import { ProgressBar } from "../../components/ProgressBar";
import { Button, cn } from "../../components/Button";

const COURSE_IMG = "https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?w=900&h=500&fit=crop&auto=format";

export function StudentCourseDetail({
  onNavigate,
  selectedCourseId,
}: {
  onNavigate?: (s: Screen) => void;
  selectedCourseId?: string;
}) {
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourseDetail() {
      const courses = await lmsService.getCourses();
      const active = selectedCourseId
        ? courses.find((c) => c.id === selectedCourseId) || courses[0]
        : courses[0];
      if (active) {
        setCourse(active);
        const secs = await lmsService.getSectionsByCourse(active.id);
        setSections(secs);
        setExpandedSections(new Set(secs.map((s) => s.id)));
      }
      setLoading(false);
    }
    loadCourseDetail();
  }, [selectedCourseId]);

  const allLessons = sections.flatMap((s) => s.lessons || []);
  const completedLessonsCount = allLessons.filter((l) => l.completed).length;
  const totalLessonsCount = allLessons.length || 15;
  const pct = Math.round((completedLessonsCount / totalLessonsCount) * 100);
  const lastViewedLesson = allLessons.find((l) => l.id === "l9") || allLessons[0];

  function toggleSection(id: string) {
    setExpandedSections((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
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

        {/* Course header with banner image */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mb-6">
          <div className="relative h-44 sm:h-52 bg-slate-900 overflow-hidden">
            <img
              src={course?.thumbnail || COURSE_IMG}
              alt={course?.title || "Course"}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
              <h1 className="text-white font-extrabold text-lg sm:text-2xl leading-snug drop-shadow-md">
                {course?.title}
              </h1>
              <p className="text-white/80 text-sm mt-1 font-medium">{course?.instructor}</p>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <p className="text-sm text-muted-foreground leading-relaxed">{course?.description}</p>

            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className="text-muted-foreground">
                  {completedLessonsCount} of {totalLessonsCount} lessons complete
                </span>
                <span className="font-bold text-foreground">{pct}%</span>
              </div>
              <ProgressBar value={pct} color="primary" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button onClick={() => onNavigate?.("course-player")} className="flex-1 sm:flex-none">
                <Play className="w-4 h-4" />
                {pct > 0 ? "Continue learning" : "Start course"}
              </Button>
              {lastViewedLesson && pct > 0 && (
                <div className="flex items-center gap-2 px-3.5 py-2 bg-muted/40 rounded-xl border border-border text-sm text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0 text-warning-foreground" />
                  <span className="truncate">
                    Resume: <strong className="text-foreground font-semibold">{lastViewedLesson.title}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Course stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          {[
            { label: "Sections", value: sections.length },
            { label: "Lessons", value: totalLessonsCount },
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
            <div className="p-8 text-center text-sm text-muted-foreground">Loading course sections...</div>
          ) : sections.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No sections created for this course yet.</div>
          ) : (
            sections.map((section, si) => {
              const expanded = expandedSections.has(section.id);
              const lessons = section.lessons || [];
              const doneCount = lessons.filter((l) => l.completed).length;
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
                        const isCurrent = lesson.id === "l9";
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => onNavigate?.("course-player")}
                            disabled={lesson.locked || lesson.notPublished}
                            className={cn(
                              "w-full flex items-center gap-3 pl-12 pr-5 py-3 border-t border-border/40 text-left transition-colors cursor-pointer",
                              lesson.locked || lesson.notPublished
                                ? "opacity-40 cursor-not-allowed"
                                : isCurrent
                                ? "bg-primary-light hover:bg-primary-light/80"
                                : "hover:bg-muted/30"
                            )}
                          >
                            <div className="flex-shrink-0">
                              {lesson.locked ? (
                                <Lock className="w-4 h-4 text-muted-foreground" />
                              ) : lesson.notPublished ? (
                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                              ) : lesson.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-success-foreground" />
                              ) : isCurrent ? (
                                <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                </div>
                              ) : lesson.type === "pdf" ? (
                                <FileText className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-sm truncate", isCurrent ? "font-bold text-primary" : "text-foreground font-medium")}>
                                {lesson.title}
                              </p>
                              {lesson.duration && (
                                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                  {lesson.type === "pdf" ? <FileText className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                  {lesson.type === "pdf" ? "PDF Resource" : lesson.duration}
                                </p>
                              )}
                            </div>
                            {isCurrent && (
                              <span className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded font-bold flex-shrink-0">
                                Current
                              </span>
                            )}
                            {lesson.notPublished && (
                              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border flex-shrink-0 font-medium">
                                Upcoming
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
