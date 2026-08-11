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
  video_id?: string | null;
  pdf_url?: string | null;
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

// ── Progress persistence helpers ───────────────────────────────────

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

async function saveProgressApi(
  lessonId: string | null,
  payload: { position_seconds?: number; videoProgressSeconds?: number; documentProgressPage?: number; completed?: boolean },
) {
  if (!lessonId) return null;
  const position_seconds = payload.position_seconds ?? payload.videoProgressSeconds;
  try {
    const response = await fetch(`/api/student/lessons/${lessonId}/progress`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        position_seconds,
        video_progress_seconds: position_seconds,
        document_progress_page: payload.documentProgressPage,
        completed: payload.completed,
      }),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn("[Progress] Autosave attempt failed quietly:", e);
  }
  return null;
}

async function loadProgressApi(lessonId: string | null) {
  if (!lessonId) return null;
  try {
    const response = await fetch(`/api/student/lessons/${lessonId}/progress`, { credentials: "include" });
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn("Load progress failed:", e);
  }
  return null;
}

export function CoursePlayer({
  onNavigate,
  selectedCourseId,
}: {
  onNavigate: (screen: Screen, params?: { courseId?: string }) => void;
  selectedCourseId?: string;
}) {
  const [courseData, setCourseData] = useState<CourseDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  // Player state
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [mobileLessonsOpen, setMobileLessonsOpen] = useState(false);

  // Refs for state persistence, auto-save timing, and Bunny iframe seek
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const currentTimeRef = useRef<number>(currentTime);
  const lastSavedTimeRef = useRef<number>(0);
  const currentLessonIdRef = useRef<string | null>(currentLessonId);
  const targetSeekPositionRef = useRef<number>(0);
  const hasResumedRef = useRef<boolean>(false);
  const markingComplete = useRef(false);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    currentLessonIdRef.current = currentLessonId;
  }, [currentLessonId]);

  const sections = courseData?.sections || [];
  const allLessonsFlat = sections.flatMap((s) => s.lessons || []);

  // Bunny Stream Player Control Abstraction
  const bunnyPlayer = {
    play: () => {
      if (!iframeRef.current?.contentWindow) return;
      try {
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ method: "play" }), "*");
      } catch (err) {
        console.warn("[CoursePlayer] Bunny play command warning:", err);
      }
    },
    pause: () => {
      if (!iframeRef.current?.contentWindow) return;
      try {
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ method: "pause" }), "*");
      } catch (err) {
        console.warn("[CoursePlayer] Bunny pause command warning:", err);
      }
    },
    seek: (targetSeconds: number) => {
      if (!iframeRef.current?.contentWindow || targetSeconds <= 0) return;
      try {
        const msg1 = JSON.stringify({ method: "setCurrentTime", value: targetSeconds });
        const msg2 = JSON.stringify({ method: "seek", value: targetSeconds });
        iframeRef.current.contentWindow.postMessage(msg1, "*");
        iframeRef.current.contentWindow.postMessage(msg2, "*");
      } catch (err) {
        console.warn("[CoursePlayer] Bunny seek command warning:", err);
      }
    },
  };

  function performBunnySeek(targetSeconds: number) {
    bunnyPlayer.seek(targetSeconds);
  }

  // Fetch course details and initial progress map on mount
  useEffect(() => {
    if (!selectedCourseId) return;
    async function loadPlayerData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/student/courses/${selectedCourseId}`, {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to load course details");
        }
        const data: CourseDetailResponse = await response.json();
        setCourseData(data);

        const allSects = data.sections || [];
        setExpandedSections(new Set(allSects.map((s) => s.id)));

        const allL = allSects.flatMap((s) => s.lessons || []);
        if (allL.length > 0) {
          setCurrentLessonId(allL[0].id);
        }

        // Fetch completion status for all lessons
        const doneIds = new Set<string>();
        const progResults = await Promise.allSettled(
          allL.map((l) => loadProgressApi(l.id))
        );
        progResults.forEach((result, idx) => {
          if (result.status === "fulfilled" && result.value?.completed) {
            doneIds.add(allL[idx].id);
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
    hasResumedRef.current = false;

    const currentLesson = sections.flatMap((s) => s.lessons || []).find((l) => l.id === currentLessonId);
    if (!currentLesson) return;

    if (currentLesson.hasVideo) {
      if (currentLesson.video_id) {
        if (currentLesson.video_id.startsWith('http://') || currentLesson.video_id.startsWith('https://')) {
          setVideoUrl(currentLesson.video_id);
        } else {
          setVideoUrl(`https://iframe.mediadelivery.net/embed/381534/${currentLesson.video_id}`);
        }
      } else {
        setVideoError(true);
      }
    } else if (currentLesson.hasDocument) {
      if (currentLesson.pdf_url) {
        setPdfUrl(currentLesson.pdf_url);
      } else {
        setPdfError(true);
      }
    }
  }, [currentLessonId, sections]);

  // Sync progress when lesson changes (Resume Playback)
  useEffect(() => {
    if (!currentLessonId) return;
    let isSubscribed = true;

    async function syncProgress() {
      const progress = await loadProgressApi(currentLessonId);
      if (!isSubscribed) return;

      if (progress) {
        const seconds = progress.video_progress_seconds || progress.position_seconds || 0;
        setCurrentTime(seconds);
        currentTimeRef.current = seconds;
        lastSavedTimeRef.current = seconds;
        targetSeekPositionRef.current = progress.completed ? 0 : seconds;
        setCurrentPage(progress.document_progress_page || 1);
        if (progress.completed) {
          setCompletedIds((prev) => new Set([...prev, currentLessonId!]));
        }
      } else {
        setCurrentTime(0);
        currentTimeRef.current = 0;
        lastSavedTimeRef.current = 0;
        targetSeekPositionRef.current = 0;
        setCurrentPage(1);
      }

      const lesson = sections.flatMap((s) => s.lessons || []).find((l) => l.id === currentLessonId);
      if (lesson && isSubscribed) {
        setTotalPages(lesson.page_count || 5);
      }
    }

    syncProgress();

    return () => {
      isSubscribed = false;
    };
  }, [currentLessonId, sections]);

  // 15-second progress autosave interval during active video playback
  useEffect(() => {
    const currentLesson = sections.flatMap((s) => s.lessons || []).find((l) => l.id === currentLessonId);
    const isPdfLesson = currentLesson?.hasDocument && !currentLesson?.hasVideo;

    if (!currentLessonId || !playing || isPdfLesson) return;

    const timer = setInterval(() => {
      const currentPos = Math.floor(currentTimeRef.current);
      if (currentPos > 0 && Math.abs(currentPos - lastSavedTimeRef.current) >= 2) {
        lastSavedTimeRef.current = currentPos;
        saveProgressApi(currentLessonId, { position_seconds: currentPos });
      }
    }, 15000);

    return () => {
      clearInterval(timer);
    };
  }, [currentLessonId, playing, sections]);

  // Save latest position on unmount or lesson transition
  useEffect(() => {
    return () => {
      const targetLessonId = currentLessonIdRef.current;
      const currentPos = Math.floor(currentTimeRef.current);
      if (targetLessonId && currentPos > 0 && Math.abs(currentPos - lastSavedTimeRef.current) >= 2) {
        lastSavedTimeRef.current = currentPos;
        saveProgressApi(targetLessonId, { position_seconds: currentPos });
      }
    };
  }, [currentLessonId]);

  // Video completion handler
  function handleVideoEnded() {
    setPlaying(false);
    if (!currentLessonId) return;
    const finalPos = Math.floor(currentTimeRef.current);
    lastSavedTimeRef.current = finalPos;
    saveProgressApi(currentLessonId, {
      position_seconds: finalPos,
      completed: true,
    }).then((res) => {
      if (res && !res.error) {
        setCompletedIds((prev) => new Set([...prev, currentLessonId!]));
        toast.success("Lesson completed!");
      }
    }).catch(() => {});
  }

  // Bunny Stream iframe postMessage listener & single-run seek resume
  useEffect(() => {
    const trustedOrigins = new Set([
      "https://iframe.mediadelivery.net",
      "https://video.bunnycdn.com",
    ]);

    function handleBunnyMessage(event: MessageEvent) {
      // 1. Enforce active iframe reference and message source
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) {
        return;
      }

      // 2. Enforce exact origin matching against trusted Bunny Stream player domains
      if (!trustedOrigins.has(event.origin)) {
        return;
      }

      let data: any = null;
      if (typeof event.data === "string") {
        try {
          data = JSON.parse(event.data);
        } catch {}
      } else if (typeof event.data === "object" && event.data !== null) {
        data = event.data;
      }

      if (!data) return;

      const eventName = data.event || data.type;
      const time = data.currentTime ?? data.data?.currentTime ?? data.value;

      if (typeof time === "number" && Number.isFinite(time) && time >= 0) {
        setCurrentTime(time);
        currentTimeRef.current = time;
      }

      if (eventName === "error") {
        console.warn("[CoursePlayer] Bunny stream player emitted error:", data);
        setVideoError(true);
        return;
      }

      // Execute single-run seek to resume saved playback position when player is ready
      if (!hasResumedRef.current && targetSeekPositionRef.current > 0) {
        if (eventName === "ready" || eventName === "play" || eventName === "playing" || eventName === "timeupdate") {
          hasResumedRef.current = true;
          performBunnySeek(targetSeekPositionRef.current);
        }
      }

      if (eventName === "play" || eventName === "playing") {
        setPlaying(true);
      } else if (eventName === "pause") {
        setPlaying(false);
        const pos = Math.floor(currentTimeRef.current);
        if (currentLessonId && pos > 0 && Math.abs(pos - lastSavedTimeRef.current) >= 1) {
          lastSavedTimeRef.current = pos;
          saveProgressApi(currentLessonId, { position_seconds: pos });
        }
      } else if (eventName === "ended") {
        setPlaying(false);
        handleVideoEnded();
      }
    }

    window.addEventListener("message", handleBunnyMessage);
    return () => {
      window.removeEventListener("message", handleBunnyMessage);
    };
  }, [currentLessonId]);

  // PDF page change handler with progress persistence
  async function handlePdfPageChange(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages || !currentLesson) return;
    setCurrentPage(nextPage);
    const isCompleted = nextPage === totalPages;
    const res = await saveProgressApi(currentLesson.id, {
      documentProgressPage: nextPage,
      completed: isCompleted,
    });
    if (isCompleted && res && !res.error) {
      setCompletedIds((prev) => new Set([...prev, currentLesson.id]));
      toast.success("PDF Lesson completed!");
    }
  }

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
      const res = await saveProgressApi(currentLesson.id, {
        position_seconds: Math.floor(currentTimeRef.current),
        completed: true,
      });

      if (res && !res.error && res.completed) {
        setCompletedIds((prev) => new Set([...prev, currentLesson.id]));
        toast.success("Lesson marked as complete!");
        if (nextLesson) {
          setTimeout(() => navigateLesson(nextLesson.id), 1500);
        }
      } else if (res?.error) {
        toast.error(res.error || "Failed to mark lesson complete");
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
      ) : (
        sections.map((section, sIdx) => {
          const isExpanded = expandedSections.has(section.id);
          const sLessons = section.lessons || [];

          return (
            <div key={section.id} className="border-b border-border/50">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-bold text-muted-foreground w-4 flex-shrink-0">
                    {sIdx + 1}
                  </span>
                  <p className="text-xs font-semibold text-foreground truncate">
                    {section.title}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="text-[10px] text-muted-foreground">
                    {sLessons.length} {sLessons.length === 1 ? "lesson" : "lessons"}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="bg-muted/10 divide-y divide-border/20">
                  {sLessons.map((lesson) => {
                    const isCurrent = lesson.id === currentLessonId;
                    const isDone = completedIds.has(lesson.id);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => navigateLesson(lesson.id)}
                        className={cn(
                          "w-full px-4 py-2.5 flex items-center gap-3 transition-colors text-left pl-8",
                          isCurrent ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-muted/30"
                        )}
                      >
                        <div className="flex-shrink-0">
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
              )}
            </div>
          );
        })
      )}
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
                    <iframe
                      ref={iframeRef}
                      src={videoUrl}
                      className="absolute inset-0 w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={currentLesson?.title || "Video Lesson"}
                    />
                  ) : videoError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white/60">
                      <AlertCircle className="w-10 h-10 text-error-foreground" />
                      <div>
                        <p className="text-sm font-semibold text-white">Video unavailable</p>
                        <p className="text-xs text-white/50 mt-1">No video stream ID associated with this lesson.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-xs text-white/40">Select a video lesson to begin playback</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col bg-muted/20 min-h-[400px]">
              {pdfUrl ? (
                <iframe
                  src={`${pdfUrl}#page=${currentPage}`}
                  className="w-full flex-1 min-h-[500px] border-0"
                  title={currentLesson?.title || "PDF Lesson"}
                />
              ) : pdfError ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground gap-2">
                  <AlertCircle className="w-8 h-8 text-error-foreground" />
                  <p className="text-sm font-semibold text-foreground">Document unavailable</p>
                  <p className="text-xs">No PDF file attached to this lesson.</p>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground text-xs">
                  Loading PDF document...
                </div>
              )}

              {/* PDF page controls */}
              <div className="p-3 bg-card border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => handlePdfPageChange(currentPage - 1)}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-xs text-muted-foreground font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => handlePdfPageChange(currentPage + 1)}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                {currentLesson?.allow_download && pdfUrl && (
                  <a
                    href={pdfUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Lesson info & navigation header */}
          <div className="p-6 bg-card border-b border-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border border-border bg-muted/20 text-muted-foreground">
                    {isPdf ? "Document" : "Video"}
                  </span>
                  {completedIds.has(currentLesson?.id || "") && (
                    <Badge variant="completed" />
                  )}
                </div>
                <h1 className="text-xl font-bold text-foreground">
                  {currentLesson?.title || "Select a lesson"}
                </h1>
                {currentLesson?.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {currentLesson.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markComplete}
                  disabled={!currentLesson || completedIds.has(currentLesson.id)}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-success-foreground" />
                  {completedIds.has(currentLesson?.id || "") ? "Completed" : "Mark as Complete"}
                </Button>
              </div>
            </div>

            {/* Bottom navigation buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                disabled={!prevLesson}
                onClick={() => prevLesson && navigateLesson(prevLesson.id)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous Lesson
              </Button>

              <button
                className="lg:hidden text-xs text-primary font-semibold flex items-center gap-1"
                onClick={() => setMobileLessonsOpen(!mobileLessonsOpen)}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Course Content
              </button>

              <Button
                variant="outline"
                size="sm"
                disabled={!nextLesson}
                onClick={() => nextLesson && navigateLesson(nextLesson.id)}
              >
                Next Lesson
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar course content drawer / column */}
        <div
          className={cn(
            "w-full lg:w-80 bg-card border-l border-border flex flex-col flex-shrink-0",
            mobileLessonsOpen ? "block" : "hidden lg:flex"
          )}
        >
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Course Content
            </h2>
            <button
              onClick={() => setMobileLessonsOpen(false)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {LessonList}
        </div>
      </div>
    </StudentLayout>
  );
}
