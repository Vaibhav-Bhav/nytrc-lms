import { useState, useEffect } from "react";
import { BookOpen, Play, Clock, Check, ChevronUp, ChevronDown, Lock, EyeOff, CheckCircle2, FileText, Circle } from "lucide-react";
import { Screen, Course, Section } from "../../../data/types";
import { lmsService } from "../../../services/lmsService";
import { StudentNav } from "../../components/StudentNav";
import { Breadcrumb } from "../../components/Breadcrumb";
import { ProgressBar } from "../../components/ProgressBar";
import { Button, cn } from "../../components/Button";

export function StudentCourseDetail({
  onNavigate,
  selectedCourseId,
}: {
  onNavigate: (s: Screen) => void;
  selectedCourseId?: string;
}) {
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourseDetail() {
      const courses = await lmsService.getCourses();
      const active = selectedCourseId ? courses.find((c) => c.id === selectedCourseId) || courses[0] : courses[0];
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
    <StudentNav current="student-courses" onNavigate={onNavigate}>
      <main className="flex-1 p-4 sm:p-6 max-w-3xl mx-auto w-full">
        <div className="mb-4">
          <Breadcrumb
            items={[
              { label: "Dashboard", onClick: () => onNavigate("student-dashboard") },
              { label: course?.title || "Course Detail" },
            ]}
          />
        </div>

        {/* Course header */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 sm:p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-foreground leading-snug">{course?.title}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{course?.instructor}</p>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{course?.description}</p>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                {completedLessonsCount} of {totalLessonsCount} lessons complete
              </span>
              <span className="font-semibold text-foreground">{pct}%</span>
            </div>
            <ProgressBar value={pct} color="primary" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <Button onClick={() => onNavigate("course-player")} className="flex-1 sm:flex-none">
              <Play className="w-4 h-4" />
              {pct > 0 ? "Continue learning" : "Start course"}
            </Button>
            {lastViewedLesson && pct > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 rounded-lg border border-border text-sm text-muted-foreground">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">
                  Resume: <strong className="text-foreground font-medium">{lastViewedLesson.title}</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Course stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
          {[
            { label: "Sections", value: sections.length },
            { label: "Lessons", value: totalLessonsCount },
            { label: "Completed", value: completedLessonsCount },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card rounded-xl border border-border shadow-sm p-3 sm:p-4 text-center">
              <p className="text-lg sm:text-2xl font-semibold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Sections + lessons */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-border">
            <h2 className="font-semibold text-foreground">Course content</h2>
          </div>
          {loading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Loading course sections...</div>
          ) : sections.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No sections created for this course yet.</div>
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
                    className="w-full flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-muted/20 transition-colors text-left"
                  >
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-semibold transition-colors",
                        allDone ? "border-emerald-500 bg-emerald-500 text-white" : "border-border text-muted-foreground"
                      )}
                    >
                      {allDone ? <Check className="w-3.5 h-3.5" /> : si + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{section.title}</p>
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
                            onClick={() => onNavigate("course-player")}
                            disabled={lesson.locked || lesson.notPublished}
                            className={cn(
                              "w-full flex items-center gap-3 pl-12 pr-4 sm:pr-5 py-2.5 border-t border-border/40 text-left transition-colors",
                              lesson.locked || lesson.notPublished
                                ? "opacity-40 cursor-not-allowed"
                                : isCurrent
                                ? "bg-primary/5 hover:bg-primary/10"
                                : "hover:bg-muted/30"
                            )}
                          >
                            <div className="flex-shrink-0">
                              {lesson.locked ? (
                                <Lock className="w-4 h-4 text-muted-foreground" />
                              ) : lesson.notPublished ? (
                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                              ) : lesson.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
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
                              <p className={cn("text-sm truncate", isCurrent ? "font-semibold text-primary" : "text-foreground")}>
                                {lesson.title}
                              </p>
                              {lesson.duration && (
                                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                  {lesson.type === "pdf" ? <FileText className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                  {lesson.type === "pdf" ? "PDF" : lesson.duration}
                                </p>
                              )}
                            </div>
                            {isCurrent && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium flex-shrink-0">
                                Current
                              </span>
                            )}
                            {lesson.notPublished && (
                              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border flex-shrink-0">
                                Soon
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
    </StudentNav>
  );
}
