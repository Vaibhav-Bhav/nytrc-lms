import { useState, useEffect, useRef } from "react";
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
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Screen } from "../../../data/types";
import { StudentLayout } from "../../components/StudentNav";
import { Button, cn } from "../../components/Button";
import { Badge } from "../../components/Badge";

// ── API types from /api/student/courses/:id ──────────────────────────────────
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

interface LessonProgress {
  lessonId: string;
  video_progress_seconds: number;
  document_progress_page: number;
  completed: boolean;
  completed_at: string | null;
}

export function CoursePlayer({
  onNavigate,
  selectedCourseId,
}: {
  onNavigate?: (s: Screen) => void;
  selectedCourseId?: string;
}) {
  const [courseData, setCourseData] = useState<ApiCourse | null>(null);
  const [sections, setSections] = useState<ApiSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "materials">("overview");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [mobileLessonsOpen, setMobileLessonsOpen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [mediaLoading, setMediaLoading] = useState(false);
  const markingComplete = useRef(false);

  useEffect(() => {
    async function loadPlayerData() {
      setLoading(true);
      try {
        // 1. Get the first enrolled course if no ID specified
        let targetId = selectedCourseId;
        if (!targetId) {
          const listRes = await fetch("/api/student/courses", { credentials: "include" });
          if (listRes.ok) {
            const list: ApiCourse[] = await listRes.json();
            targetId = list[0]?.id;
          }
        }
        if (!targetId) { setLoading(false); return; }

        // 2. Load course detail (sections + lessons)
        const detailRes = await fetch(`/api/student/courses/${targetId}`, { credentials: "include" });
        if (!detailRes.ok) throw new Error("Failed to load course");
        const detail: CourseDetailResponse = await detailRes.json();
        setCourseData(detail.course);
        setSections(detail.sections);
        setExpandedSections(new Set(detail.sections.map((s) => s.id)));

        // 3. Set first lesson as current
        const allLessonsFlat = detail.sections.flatMap((s) => s.lessons || []);
        if (allLessonsFlat.length > 0) {
          setCurrentLessonId(allLessonsFlat[0].id);
        }

        // 4. Batch-load progress for all lessons (best effort)
        const progResults = await Promise.allSettled(
          allLessonsFlat.map((l) =>
            fetch(`/api/student/progress/${l.id}`, { credentials: "include" })
              .then((r) => r.ok ? r.json() as Promise<LessonProgress> : null)
              .catch(() => null)
          )
        );
        const doneIds = new Set<string>();
        progResults.forEach((result, idx) => {
          if (result.status === "fulfilled" && result.value?.completed) {
            doneIds.add(allLessonsFlat[idx].id);
          }
        });
        setCompletedIds(doneIds);
      } catch (err: any) {
        toast.error(err.message || "Failed to load course player");
      } finally {
        setLoading(false);
      }
    }
    loadPlayerData();
  }, [selectedCourseId]);

  // Load media URL when current lesson changes
  useEffect(() => {
    if (!currentLessonId) return;
    setVideoUrl(null);
    setPdfUrl(null);
    setVideoError(false);
    setPdfError(false);
    setPlaying(false);

    const currentLesson = sections.flatMap((s) => s.lessons || []).find((l) => l.id === currentLessonId);
    if (!currentLesson) return;

    setMediaLoading(true);
    if (currentLesson.hasVideo) {
      fetch(`/api/student/lessons/${currentLessonId}/video`, { credentials: "include" })
        .then((r) => r.ok ? r.json() : Promise.reject(r))
        .then((data) => { setVideoUrl(data.embedUrl || data.url || null); })
        .catch(() => setVideoError(true))
        .finally(() => setMediaLoading(false));
    } else if (currentLesson.hasDocument) {
      fetch(`/api/student/lessons/${currentLessonId}/document`, { credentials: "include" })
        .then((r) => r.ok ? r.json() : Promise.reject(r))
        .then((data) => { setPdfUrl(data.url || null); })
        .catch(() => setPdfError(true))
        .finally(() => setMediaLoading(false));
    } else {
      setMediaLoading(false);
    }
  }, [currentLessonId]);

  const allLessons = sections.flatMap((s) => s.lessons || []);
  const currentIdx = allLessons.findIndex((l) => l.id === currentLessonId);
  const currentLesson = allLessons[currentIdx] ?? allLessons[0] ?? null;
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;
  const isPdf = currentLesson?.hasDocument && !currentLesson?.hasVideo;

  function navigateLesson(id: string) {
    setCurrentLessonId(id);
    setVideoError(false);
    setPdfError(false);
    setPlaying(false);
    setMobileLessonsOpen(false);
  }

  async function markComplete() {
    if (!currentLesson || markingComplete.current) return;
    markingComplete.current = true;
    try {
      const res = await fetch("/api/student/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lessonId: currentLesson.id, completed: true }),
      });
      if (res.ok) {
        setCompletedIds((prev) => new Set([...prev, currentLesson.id]));
        toast.success("Lesson marked as complete!");
        // Auto-advance to next lesson after 1.5s
        if (nextLesson) {
          setTimeout(() => navigateLesson(nextLesson.id), 1500);
        }
      } else {
        toast.error("Failed to mark lesson complete");
      }
    } catch (err) {
      toast.error("Failed to mark lesson complete");
    } finally {
      markingComplete.current = false;
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
      {loading ? (
        <div className="flex items-center justify-center p-8 gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs">Loading lessons...</span>
        </div>
      ) : sections.length === 0 ? (
        <div className="p-6 text-center">
          <BookOpen className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No lessons available</p>
        </div>
      ) : sections.map((section) => {
        const expanded = expandedSections.has(section.id);
        const lessons = section.lessons || [];
        const doneCount = lessons.filter((l) => completedIds.has(l.id)).length;

        return (
          <div key={section.id} className="border-b border-border last:border-0">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors text-left font-medium cursor-pointer"
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

                return (
                  <button
                    key={lesson.id}
                    onClick={() => navigateLesson(lesson.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors border-t border-border/60 cursor-pointer",
                      isCurrent ? "bg-primary-light" : "hover:bg-muted/30"
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-success-foreground" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                      ) : lesson.hasDocument && !lesson.hasVideo ? (
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-xs leading-snug truncate",
                          isCurrent ? "font-bold text-primary" : "text-foreground font-medium"
                        )}
                      >
                        {lesson.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {lesson.hasVideo ? "Video" : "PDF"}{lesson.allow_download ? " · DL" : ""}
                      </p>
                    </div>
                  </button>
                );
              })}
          </div>
        );
      })}
    </div>
  );

  return (
    <StudentLayout>
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-64px)]">
        {/* Main player content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {!isPdf ? (
            <div className="bg-slate-950">
              <div className="relative" style={{ paddingBottom: "56.25%" }}>
                <div className="absolute inset-0">
                  {mediaLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                      <Loader2 className="w-8 h-8 animate-spin text-white/30" />
                    </div>
                  ) : videoUrl ? (
                    // Real Bunny Stream embed
                    <iframe
                      src={videoUrl}
                      className="absolute inset-0 w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={currentLesson?.title || "Video Lesson"}
                    />
                  ) : videoError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <AlertCircle className="w-10 h-10 text-white/30" />
                      <div className="text-center px-4">
                        <p className="text-white/70 font-medium text-sm">Video failed to load</p>
                        <p className="text-white/40 text-xs mt-1">Check your connection and try again</p>
                      </div>
                      <button
                        onClick={() => { setVideoError(false); setCurrentLessonId((id) => id); }}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                      </button>
                    </div>
                  ) : (
                    // Fallback player UI (no Bunny credentials yet)
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-primary/40" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <button
                          onClick={() => setPlaying(!playing)}
                          className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md flex items-center justify-center transition-colors border border-white/20 shadow-xl cursor-pointer"
                        >
                          {playing ? <Pause className="w-7 h-7 text-white" /> : <Play className="w-7 h-7 text-white ml-1" />}
                        </button>
                        <div className="text-center px-4">
                          <p className="text-white font-bold text-xs sm:text-sm">{currentLesson?.title}</p>
                          <p className="text-white/50 text-xs mt-0.5">Video Lesson</p>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 sm:px-6 pt-8 pb-3">
                        <div className="h-1.5 bg-white/20 rounded-full mb-3 cursor-pointer group">
                          <div className="w-0 h-full bg-primary rounded-full relative">
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
                      {currentLesson?.allow_download ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-success-foreground flex items-center gap-1 font-semibold hidden sm:flex">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Download allowed
                          </span>
                          {pdfUrl && (
                            <Button variant="secondary" size="sm" onClick={() => window.open(pdfUrl, "_blank")}>
                              <Download className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Download PDF</span>
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                          <Lock className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Download restricted</span>
                        </span>
                      )}
                    </div>
                  </div>
                  {mediaLoading ? (
                    <div className="h-72 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : pdfUrl ? (
                    <iframe
                      src={pdfUrl}
                      className="w-full"
                      style={{ height: "72vh" }}
                      title={currentLesson?.title || "PDF Document"}
                    />
                  ) : (
                    <div className="h-72 flex items-center justify-center bg-muted/10">
                      <div className="text-center">
                        <FileText className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm font-medium">PDF document will appear here</p>
                        <p className="text-xs text-muted-foreground mt-1">Upload a PDF file in the Admin panel to enable this lesson</p>
                      </div>
                    </div>
                  )}
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
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentLesson?.description || "In this lesson you'll explore core technical concepts, step-by-step demonstrations, and hands-on exercises tailored for this course module."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-w-2xl">
                {allLessons
                  .filter((l) => l.hasDocument && !l.hasVideo)
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
                      {lesson.allow_download ? (
                        <Button variant="ghost" size="sm" className="flex-shrink-0" onClick={() => navigateLesson(lesson.id)}>
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
                {allLessons.filter((l) => l.hasDocument && !l.hasVideo).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">No PDF materials in this course</p>
                )}
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
            {currentLesson && !completedIds.has(currentLesson.id) ? (
              <button
                onClick={markComplete}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-success-foreground hover:underline transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Mark as complete</span>
              </button>
            ) : (
              <span className="flex items-center gap-1.5 text-xs sm:text-sm text-success-foreground font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Completed</span>
              </span>
            )}
            <Button
              variant="secondary"
              size="sm"
              disabled={!nextLesson}
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
