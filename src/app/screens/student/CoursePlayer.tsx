import { useState, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  FileText,
  CheckCircle2,
  Lock,
  EyeOff,
  Circle,
  Clock,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  AlertCircle,
  X,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Screen, Section } from "../../../data/types";
import { lmsService } from "../../../services/lmsService";
import { StudentLayout } from "../../components/StudentNav";
import { Button, cn } from "../../components/Button";
import { Badge } from "../../components/Badge";

export function CoursePlayer({
  onNavigate,
  selectedCourseId,
}: {
  onNavigate: (s: Screen) => void;
  selectedCourseId?: string;
}) {
  const [sections, setSections] = useState<Section[]>([]);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "materials">("overview");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [currentLessonId, setCurrentLessonId] = useState("l9");
  const [mobileLessonsOpen, setMobileLessonsOpen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadPlayerData() {
      const courses = await lmsService.getCourses();
      const active = selectedCourseId
        ? courses.find((c) => c.id === selectedCourseId) || courses[0]
        : courses[0];
      if (active) {
        const secs = await lmsService.getSectionsByCourse(active.id);
        setSections(secs);
        setExpandedSections(new Set(secs.map((s) => s.id)));

        const all = secs.flatMap((s) => s.lessons || []);
        const completedSet = new Set(all.filter((l) => l.completed).map((l) => l.id));
        setCompletedIds(completedSet);

        if (all.length > 0 && !all.some((l) => l.id === currentLessonId)) {
          setCurrentLessonId(all[0].id);
        }
      }
    }
    loadPlayerData();
  }, [selectedCourseId]);

  const allLessons = sections.flatMap((s) => s.lessons || []);
  const currentIdx = allLessons.findIndex((l) => l.id === currentLessonId);
  const currentLesson = allLessons[currentIdx] || allLessons[0];
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;
  const isPdf = currentLesson?.type === "pdf";

  function navigateLesson(id: string) {
    const lesson = allLessons.find((l) => l.id === id);
    if (lesson?.locked) return;
    setCurrentLessonId(id);
    setVideoError(false);
    setPdfError(false);
    setPlaying(false);
    setMobileLessonsOpen(false);
  }

  async function markComplete() {
    if (!currentLesson) return;
    try {
      await lmsService.markLessonComplete(currentLesson.id);
      setCompletedIds((prev) => new Set([...prev, currentLesson.id]));
      toast.success("Lesson marked as complete");
    } catch (err) {
      toast.error("Failed to mark lesson complete");
    }
  }

  function toggleSection(id: string) {
    setExpandedSections((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  const LessonList = (
    <div className="flex-1 overflow-y-auto">
      {sections.map((section) => {
        const expanded = expandedSections.has(section.id);
        const lessons = section.lessons || [];
        const doneCount = lessons.filter((l) => completedIds.has(l.id)).length;

        return (
          <div key={section.id} className="border-b border-border last:border-0">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors text-left font-medium"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground">{section.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {doneCount}/{lessons.length} done
                </p>
              </div>
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              )}
            </button>
            {expanded &&
              lessons.map((lesson) => {
                const isCurrent = currentLessonId === lesson.id;
                const isDone = completedIds.has(lesson.id);
                const isNotPublished = lesson.notPublished || lesson.published === false;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => !lesson.locked && !isNotPublished && navigateLesson(lesson.id)}
                    disabled={lesson.locked || isNotPublished}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors border-t border-border/60 cursor-pointer",
                      lesson.locked || isNotPublished
                        ? "opacity-50 cursor-not-allowed"
                        : isCurrent
                        ? "bg-primary/10"
                        : "hover:bg-muted/30"
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {lesson.locked ? (
                        <Lock className="w-4 h-4 text-muted-foreground/50" />
                      ) : isNotPublished ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground/40" />
                      ) : isDone ? (
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
                      <p
                        className={cn(
                          "text-xs leading-snug truncate",
                          isCurrent
                            ? "font-bold text-primary"
                            : lesson.locked || isNotPublished
                            ? "text-muted-foreground"
                            : "text-foreground font-medium"
                        )}
                      >
                        {lesson.title}
                        {lesson.locked && <span className="ml-1 text-muted-foreground/50">(locked)</span>}
                        {isNotPublished && <span className="ml-1 text-muted-foreground/40">(draft)</span>}
                      </p>
                      {lesson.duration && !isNotPublished && (
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lesson.duration}
                        </p>
                      )}
                      {isNotPublished && <p className="text-xs text-muted-foreground/50 mt-0.5">Coming soon</p>}
                    </div>
                    {isNotPublished && (
                      <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded border border-border flex-shrink-0">
                        Draft
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        );
      })}
    </div>
  );

  return (
    <StudentLayout current="course-player" onNavigate={onNavigate}>
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-64px)]">
        {/* Main player content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {!isPdf ? (
            <div className="bg-[#071828]">
              <div className="relative" style={{ paddingBottom: "56.25%" }}>
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#071828] via-[#0C2040] to-[#1549A8]/40" />
                  {videoError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <AlertCircle className="w-10 h-10 text-white/30" />
                      <div className="text-center px-4">
                        <p className="text-white/70 font-medium text-sm">Video failed to load</p>
                        <p className="text-white/40 text-xs mt-1">Check your connection and try again</p>
                      </div>
                      <button
                        onClick={() => setVideoError(false)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <button
                          onClick={() => setPlaying(!playing)}
                          className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md flex items-center justify-center transition-colors border border-white/20 shadow-xl cursor-pointer"
                        >
                          {playing ? <Pause className="w-7 h-7 text-white" /> : <Play className="w-7 h-7 text-white ml-1" />}
                        </button>
                        <div className="text-center px-4">
                          <p className="text-white font-bold text-xs sm:text-sm">{currentLesson?.title}</p>
                          <p className="text-white/50 text-xs mt-0.5">{currentLesson?.duration || "Video Lesson"}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setVideoError(true)}
                        className="absolute top-3 right-3 text-white/20 hover:text-white/40 text-xs transition-colors cursor-pointer"
                      >
                        sim error
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 sm:px-6 pt-8 pb-3">
                        <div className="h-1.5 bg-white/20 rounded-full mb-3 cursor-pointer group">
                          <div className="w-[37%] h-full bg-primary rounded-full relative">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <button onClick={() => setPlaying(!playing)} className="text-white/80 hover:text-white transition-colors cursor-pointer">
                              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </button>
                            <button onClick={() => setMuted(!muted)} className="text-white/80 hover:text-white transition-colors cursor-pointer">
                              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                            <span className="text-white/50 text-xs tabular-nums hidden sm:inline">
                              11:28 / {currentLesson?.duration || "25:00"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="text-white/60 hover:text-white text-xs px-2 py-0.5 border border-white/20 rounded-lg transition-colors cursor-pointer">
                              1×
                            </button>
                            <button className="text-white/80 hover:text-white transition-colors cursor-pointer">
                              <Maximize2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-muted/20 p-4 sm:p-6">
              {pdfError ? (
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground truncate">{currentLesson?.title}</span>
                  </div>
                  <div className="h-64 flex flex-col items-center justify-center gap-4">
                    <AlertCircle className="w-9 h-9 text-muted-foreground/30" />
                    <div className="text-center">
                      <p className="text-sm text-foreground font-semibold">PDF failed to load</p>
                      <p className="text-xs text-muted-foreground mt-1">There was a problem fetching this document.</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => setPdfError(false)}>
                      <RefreshCw className="w-3.5 h-3.5" />
                      Try again
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30 gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm font-bold text-foreground truncate">{currentLesson?.title}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setPdfError(true)}
                        className="text-xs text-muted-foreground/30 hover:text-muted-foreground transition-colors hidden sm:block cursor-pointer"
                      >
                        sim err
                      </button>
                      {currentLesson?.hasDownload || currentLesson?.downloadPermission ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold hidden sm:flex">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Download allowed
                          </span>
                          <Button variant="secondary" size="sm">
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Download PDF</span>
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                          <Lock className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Download restricted</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-72 flex items-center justify-center bg-muted/10">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm font-medium">PDF Reader Document Canvas</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile view lessons */}
          <div className="lg:hidden px-4 pt-3">
            <Button variant="secondary" className="w-full" size="sm" onClick={() => setMobileLessonsOpen(true)}>
              <BookOpen className="w-4 h-4" />
              View course content
            </Button>
          </div>

          {/* Tabs */}
          <div className="px-5 sm:px-6 pt-4 pb-4">
            <div className="flex border-b border-border mb-5">
              {(["overview", "materials"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2.5 text-sm font-bold -mb-px border-b-2 transition-colors cursor-pointer",
                    activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab === "overview" ? "Overview" : "Materials"}
                </button>
              ))}
            </div>
            {activeTab === "overview" ? (
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-bold text-foreground text-base">{currentLesson?.title}</h3>
                  {currentLesson && !completedIds.has(currentLessonId) && currentLesson.type === "video" && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 flex-shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      Resume from 11:28
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  In this lesson you'll explore core technical concepts, step-by-step demonstrations, and hands-on exercises tailored for this course module.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-w-2xl">
                {allLessons
                  .filter((l) => l.type === "pdf")
                  .map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-border hover:bg-muted/30 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm font-semibold text-foreground truncate">{lesson.title}</span>
                        {completedIds.has(lesson.id) && <Badge variant="completed" />}
                      </div>
                      {lesson.hasDownload || lesson.downloadPermission ? (
                        <Button variant="ghost" size="sm" className="flex-shrink-0">
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground flex-shrink-0 flex items-center gap-1 font-medium">
                          <Lock className="w-3 h-3" />
                          Restricted
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="border-t border-border bg-card px-5 py-3.5 flex items-center justify-between sticky bottom-0 gap-3">
            <Button
              variant="secondary"
              size="sm"
              disabled={!prevLesson}
              onClick={() => prevLesson && navigateLesson(prevLesson.id)}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            {isPdf && !completedIds.has(currentLessonId) && (
              <button
                onClick={markComplete}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Mark as complete</span>
              </button>
            )}
            {isPdf && completedIds.has(currentLessonId) && (
              <span className="flex items-center gap-1.5 text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Completed</span>
              </span>
            )}
            <Button
              variant="secondary"
              size="sm"
              disabled={!nextLesson || nextLesson.locked}
              onClick={() => nextLesson && navigateLesson(nextLesson.id)}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:flex w-72 border-l border-border bg-card flex-col flex-shrink-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border flex-shrink-0 bg-muted/20">
            <p className="text-sm font-bold text-foreground">Course content</p>
          </div>
          {LessonList}
        </div>

        {/* Mobile lessons overlay */}
        {mobileLessonsOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-card">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border flex-shrink-0">
              <p className="font-bold text-foreground">Course content</p>
              <button onClick={() => setMobileLessonsOpen(false)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            {LessonList}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
