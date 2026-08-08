import { useState, useEffect, useRef } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize2, FileText, CheckCircle2,
  Lock, EyeOff, Circle, Clock, ChevronUp, ChevronDown, ChevronLeft,
  ChevronRight, RefreshCw, Download, AlertCircle, X, BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { Screen, Section } from "../../../data/types";
import { lmsService } from "../../../services/lmsService";
import { StudentNav } from "../../components/StudentNav";
import { Button, cn } from "../../components/Button";
import { Badge } from "../../components/Badge";

function parseDuration(duration?: string | null): number {
  if (!duration) return 900; // default 15 mins
  const parts = duration.split(":");
  if (parts.length === 2) {
    const mins = parseInt(parts[0], 10) || 0;
    const secs = parseInt(parts[1], 10) || 0;
    return mins * 60 + secs;
  }
  const match = duration.match(/(\d+)/);
  if (match) {
    return parseInt(match[1], 10) * 60;
  }
  return 900;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

async function saveProgressApi(
  lessonId: string,
  payload: { videoProgressSeconds?: number; documentProgressPage?: number; completed?: boolean },
) {
  try {
    const response = await fetch("/api/student/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonId,
        videoProgressSeconds: payload.videoProgressSeconds,
        documentProgressPage: payload.documentProgressPage,
        completed: payload.completed,
      }),
    });
    if (response.ok) {
      return await response.json();
    }
    if (response.status === 401) {
      console.warn("[Progress] No active session found. Running in mock/localStorage mode.");
      if (payload.completed) {
        await lmsService.markLessonComplete(lessonId);
      }
      return null;
    }
    toast.error("Failed to save progress to the server.");
    throw new Error(`Server returned status ${response.status}`);
  } catch (e) {
    console.error("Progress save failed:", e);
    toast.error("Network error: Progress could not be saved to server.");
    throw e;
  }
}

async function loadProgressApi(lessonId: string) {
  try {
    const response = await fetch(`/api/student/progress/${lessonId}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn("Real API load progress failed:", e);
  }
  return null;
}

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
  const [pdfLoading, setPdfLoading] = useState(false);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [currentTime, setCurrentTime] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastSavedTimeRef = useRef<number>(0);

  useEffect(() => {
    async function loadPlayerData() {
      const courses = await lmsService.getCourses();
      const active = selectedCourseId ? courses.find((c) => c.id === selectedCourseId) || courses[0] : courses[0];
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

  useEffect(() => {
    if (!currentLessonId) return;
    async function syncProgress() {
      const progress = await loadProgressApi(currentLessonId);
      if (progress) {
        const seconds = progress.video_progress_seconds || 0;
        setCurrentTime(seconds);
        setCurrentPage(progress.document_progress_page || 1);
        lastSavedTimeRef.current = seconds;
        if (videoRef.current) {
          videoRef.current.currentTime = seconds;
        }
        if (progress.completed) {
          setCompletedIds((prev) => new Set([...prev, currentLessonId]));
        }
      } else {
        setCurrentTime(0);
        setCurrentPage(1);
        lastSavedTimeRef.current = 0;
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
        }
      }
      const lesson = allLessons.find((l) => l.id === currentLessonId);
      if (lesson) {
        setTotalPages((lesson as any).page_count || (lesson as any).pageCount || 5);
      }
    }
    syncProgress();
  }, [currentLessonId, sections]);

  function handleTimeUpdate(time: number) {
    setCurrentTime(time);
    if (Math.abs(time - lastSavedTimeRef.current) >= 15) {
      lastSavedTimeRef.current = time;
      saveProgressApi(currentLessonId, { videoProgressSeconds: Math.floor(time) });
    }
  }

  function handleVideoEnded() {
    setPlaying(false);
    saveProgressApi(currentLessonId, {
      videoProgressSeconds: parseDuration(currentLesson?.duration || "15:00"),
      completed: true,
    }).then(() => {
      setCompletedIds((prev) => new Set([...prev, currentLessonId]));
      toast.success("Lesson completed!");
    });
  }

  async function handlePdfPageChange(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages) return;
    setCurrentPage(nextPage);
    const isCompleted = nextPage === totalPages;
    await saveProgressApi(currentLesson.id, {
      documentProgressPage: nextPage,
      completed: isCompleted,
    });
    if (isCompleted) {
      setCompletedIds((prev) => new Set([...prev, currentLesson.id]));
      toast.success("PDF Lesson completed!");
    }
  }

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

    if (lesson?.type === "pdf") {
      setPdfLoading(true);
      setTimeout(() => setPdfLoading(false), 400);
    }
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
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">{section.title}</p>
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
                      "w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors border-t border-border/60",
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
                            ? "font-semibold text-primary"
                            : lesson.locked || isNotPublished
                            ? "text-muted-foreground"
                            : "text-foreground"
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
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <StudentNav current="course-player" onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Main player content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {!isPdf ? (
            <div className="bg-slate-900">
              <div className="relative" style={{ paddingBottom: "56.25%" }}>
                <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                    className="w-full h-full object-contain"
                    onTimeUpdate={(e) => handleTimeUpdate(e.currentTarget.currentTime)}
                    onEnded={handleVideoEnded}
                    muted={muted}
                    playsInline
                  />
                  {videoError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 gap-4">
                      <AlertCircle className="w-10 h-10 text-white/30" />
                      <div className="text-center px-4">
                        <p className="text-white/70 font-medium text-sm">Video failed to load</p>
                        <p className="text-white/40 text-xs mt-1">Check your connection and try again</p>
                      </div>
                      <button
                        onClick={() => setVideoError(false)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                      </button>
                    </div>
                  ) : (
                    <>
                      {!playing && (
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3">
                          <button
                            onClick={() => {
                              if (videoRef.current) {
                                videoRef.current.play().catch(console.error);
                                setPlaying(true);
                              }
                            }}
                            className="w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center transition-colors border border-white/20"
                          >
                            <Play className="w-6 h-6 text-white ml-0.5" />
                          </button>
                          <div className="text-center px-4">
                            <p className="text-white font-medium text-xs sm:text-sm">{currentLesson?.title}</p>
                            <p className="text-white/50 text-xs mt-0.5">{currentLesson?.duration || "Video Lesson"}</p>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => setVideoError(true)}
                        className="absolute top-3 right-3 text-white/20 hover:text-white/40 text-xs transition-colors"
                      >
                        sim error
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 sm:px-4 pt-8 pb-2 sm:pb-3">
                        <div
                          className="h-1 bg-white/20 rounded-full mb-3 cursor-pointer group"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const clickX = e.clientX - rect.left;
                            const width = rect.width;
                            const pct = clickX / width;
                            const durationSeconds = parseDuration(currentLesson?.duration || "15:00");
                            const seekTime = Math.floor(pct * durationSeconds);
                            setCurrentTime(seekTime);
                            if (videoRef.current) {
                              videoRef.current.currentTime = seekTime;
                            }
                            saveProgressApi(currentLesson.id, { videoProgressSeconds: seekTime });
                          }}
                        >
                          <div
                            className="h-full bg-primary rounded-full relative"
                            style={{ width: `${(currentTime / parseDuration(currentLesson?.duration || "15:00")) * 100}%` }}
                          >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <button
                              onClick={() => {
                                if (videoRef.current) {
                                  if (playing) {
                                    videoRef.current.pause();
                                    setPlaying(false);
                                  } else {
                                    videoRef.current.play().catch(console.error);
                                    setPlaying(true);
                                  }
                                }
                              }}
                              className="text-white/80 hover:text-white transition-colors"
                            >
                              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </button>
                            <button onClick={() => setMuted(!muted)} className="text-white/80 hover:text-white transition-colors">
                              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                            <span className="text-white/50 text-xs tabular-nums hidden sm:inline">
                              {formatTime(currentTime)} / {currentLesson?.duration || "15:00"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="text-white/60 hover:text-white text-xs px-2 py-0.5 border border-white/20 rounded transition-colors">
                              1×
                            </button>
                            <button className="text-white/80 hover:text-white transition-colors">
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
            <div className="bg-muted/20 p-4 sm:p-5">
              {pdfLoading ? (
                <div className="bg-card rounded-xl border border-border shadow-sm p-8 text-center animate-pulse">
                  <div className="w-10 h-10 rounded-lg bg-muted mx-auto mb-3" />
                  <div className="h-4 bg-muted rounded w-48 mx-auto mb-2" />
                  <div className="h-3 bg-muted rounded w-32 mx-auto" />
                </div>
              ) : pdfError ? (
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground truncate">{currentLesson?.title}</span>
                  </div>
                  <div className="h-56 sm:h-64 flex flex-col items-center justify-center gap-4">
                    <AlertCircle className="w-9 h-9 text-muted-foreground/30" />
                    <div className="text-center">
                      <p className="text-sm text-foreground font-medium">PDF failed to load</p>
                      <p className="text-xs text-muted-foreground mt-1">There was a problem fetching this document.</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => { setPdfError(false); setPdfLoading(true); setTimeout(() => setPdfLoading(false), 300); }}>
                      <RefreshCw className="w-3.5 h-3.5" />
                      Try again
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30 gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-semibold text-foreground truncate">{currentLesson?.title}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setPdfError(true)}
                        className="text-xs text-muted-foreground/30 hover:text-muted-foreground transition-colors hidden sm:block"
                      >
                        sim err
                      </button>
                      {(currentLesson?.allow_download ?? currentLesson?.downloadPermission ?? currentLesson?.hasDownload) ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hidden sm:flex font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Download allowed
                          </span>
                          <Button variant="secondary" size="sm" onClick={() => toast.success("Downloading PDF document...")}>
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Download</span>
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium bg-muted/50 px-2 py-1 rounded border border-border">
                          <Lock className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Download restricted</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-56 sm:h-72 flex flex-col items-center justify-center bg-muted/10 p-4">
                    <div className="text-center mb-4">
                      <FileText className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm font-medium">Document content preview</p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">Page {currentPage} of {totalPages}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={currentPage <= 1}
                        onClick={() => handlePdfPageChange(currentPage - 1)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous Page
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={currentPage >= totalPages}
                        onClick={() => handlePdfPageChange(currentPage + 1)}
                      >
                        Next Page
                        <ChevronRight className="w-4 h-4" />
                      </Button>
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
          <div className="px-4 sm:px-5 pt-4 pb-2">
            <div className="flex border-b border-border mb-5">
              {(["overview", "materials"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2.5 text-sm font-semibold -mb-px border-b-2 transition-colors",
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
                  <h3 className="font-semibold text-foreground">{currentLesson?.title}</h3>
                  {currentLesson && !completedIds.has(currentLessonId) && currentLesson.type === "video" && currentTime > 0 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg text-xs font-medium text-amber-700 dark:text-amber-400 flex-shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      Resume from {formatTime(currentTime)}
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  In this lesson you'll explore core technical concepts, step-by-step demonstrations, and hands-on exercises tailored for this course module.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-w-2xl">
                {allLessons
                  .filter((l) => l.type === "pdf")
                  .map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-foreground truncate">{lesson.title}</span>
                        {completedIds.has(lesson.id) && <Badge variant="completed" />}
                      </div>
                      {lesson.hasDownload || lesson.downloadPermission ? (
                        <Button variant="ghost" size="sm" className="flex-shrink-0">
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground flex-shrink-0 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Restricted
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Prev / Next controls */}
          <div className="border-t border-border bg-card px-4 sm:px-5 py-3 flex items-center justify-between sticky bottom-0 gap-3">
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
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Mark as complete</span>
              </button>
            )}
            {isPdf && completedIds.has(currentLessonId) && (
              <span className="flex items-center gap-1.5 text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
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
          <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
            <p className="text-sm font-semibold text-foreground">Course content</p>
          </div>
          {LessonList}
        </div>

        {/* Mobile lessons overlay */}
        {mobileLessonsOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-card">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border flex-shrink-0">
              <p className="font-semibold text-foreground">Course content</p>
              <button onClick={() => setMobileLessonsOpen(false)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            {LessonList}
          </div>
        )}
      </div>
    </div>
  );
}
