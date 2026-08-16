import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Upload,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Trash2,
  FileText,
  Play,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Screen, Section, UploadStage } from "../../../data/types";
import { AdminLayout } from "../../components/AdminLayout";
import { Breadcrumb } from "../../components/Breadcrumb";
import { Button, cn } from "../../components/Button";
import { Badge } from "../../components/Badge";
import { Modal } from "../../components/Modal";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { FormInput } from "../../components/FormInput";
import { FileUpload } from "../../components/FileUpload";
import { UploadPipeline } from "../../components/UploadPipeline";

// ── API helpers ─────────────────────────────────────────────────────────────

async function apiAdmin(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ── Type helpers ─────────────────────────────────────────────────────────────

interface DbCourse {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  status: "draft" | "published";
  price: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface DbSection {
  id: string;
  course_id: string;
  title: string;
  order_number: number;
  created_at: string;
  updated_at: string;
}

interface DbLesson {
  id: string;
  section_id: string;
  title: string;
  description: string | null;
  pdf_url: string | null;
  video_id: string | null;
  allow_download: boolean;
  page_count: number | null;
  lesson_order: number;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
}

// Map DB lesson → UI Lesson
function toUiLesson(l: DbLesson) {
  return {
    id: l.id,
    sectionId: l.section_id,
    title: l.title,
    type: ((l.pdf_url && l.pdf_url !== "") ? "pdf" : "video") as "video" | "pdf",
    order: l.lesson_order,
    status: l.status,
    published: l.status === "published",
    downloadPermission: l.allow_download,
    hasDownload: l.allow_download,
    completed: false,
    locked: false,
    notPublished: l.status === "draft",
    description: l.description,
    videoId: l.video_id === "00000000-0000-4000-8000-000000000000" ? "" : l.video_id,
    pdfUrl: l.pdf_url === "https://nytrc.in/empty.pdf" ? "" : l.pdf_url,
  };
}

// Map DB course → UI Course shape
function toUiCourse(c: DbCourse) {
  return {
    id: c.id,
    title: c.title,
    description: c.description ?? "",
    instructor: "",
    status: c.status,
    thumbnail: c.thumbnail_url ?? undefined,
  };
}

// ── Component ────────────────────────────────────────────────────────────────

export function AdminContent({
  onNavigate,
  selectedCourseId,
  onSelectCourse,
}: {
  onNavigate?: (s: Screen) => void;
  selectedCourseId?: string;
  onSelectCourse?: (id: string) => void;
}) {
  const [allCourses, setAllCourses] = useState<ReturnType<typeof toUiCourse>[]>([]);
  const [course, setCourse] = useState<ReturnType<typeof toUiCourse> | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Upload state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<UploadStage>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Add/Edit Lesson modal state
  const [addLessonModal, setAddLessonModal] = useState<{ sectionId: string; lessonId?: string } | null>(null);
  const [previewModal, setPreviewModal] = useState<{ url: string, type: 'video' | 'pdf' } | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonDesc, setNewLessonDesc] = useState("");
  const [newLessonType, setNewLessonType] = useState<"video" | "pdf" | "text" | "link">("video");
  const [newLessonVideoId, setNewLessonVideoId] = useState("");
  const [newLessonPdfUrl, setNewLessonPdfUrl] = useState("");
  const [lessonLoading, setLessonLoading] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{ sectionId: string; lessonId: string; title: string; progressCount?: number } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Add Section modal state
  const [addSectionModal, setAddSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionDesc, setNewSectionDesc] = useState("");
  const [sectionLoading, setSectionLoading] = useState(false);

  // Publish Course modal state
  const [publishModal, setPublishModal] = useState(false);
  const [publishState, setPublishState] = useState<"idle" | "publishing" | "published">("idle");

  // Delete Course modal state
  const [deleteCourseModal, setDeleteCourseModal] = useState(false);
  const [deleteCourseLoading, setDeleteCourseLoading] = useState(false);

  // ── Data loading ───────────────────────────────────────────────────────────

  async function loadSectionsForCourse(courseId: string): Promise<Section[]> {
    const dbSections: DbSection[] = await apiAdmin(`/api/courses/${courseId}/sections`);
    const sectionsWithLessons: Section[] = await Promise.all(
      dbSections.map(async (sec) => {
        let lessons: ReturnType<typeof toUiLesson>[] = [];
        try {
          const dbLessons: DbLesson[] = await apiAdmin(`/api/sections/${sec.id}/lessons`);
          lessons = dbLessons.map(toUiLesson);
        } catch {
          lessons = [];
        }
        return {
          id: sec.id,
          courseId: sec.course_id,
          title: sec.title,
          order: sec.order_number,
          published: true, // sections don't have a published flag in DB
          lessons,
        };
      })
    );
    return sectionsWithLessons;
  }

  const loadContentData = async (targetId?: string) => {
    setLoading(true);
    try {
      const dbCourses: DbCourse[] = await apiAdmin("/api/admin/courses");
      const uiCourses = dbCourses.map(toUiCourse);
      setAllCourses(uiCourses);

      const activeCourse = targetId
        ? uiCourses.find((c) => c.id === targetId) || uiCourses[0]
        : uiCourses.find((c) => c.id === selectedCourseId) || uiCourses[uiCourses.length - 1] || uiCourses[0];

      if (activeCourse) {
        setCourse(activeCourse);
        const secs = await loadSectionsForCourse(activeCourse.id);
        setSections(secs);
        setExpandedSections(new Set(secs.map((s) => s.id)));
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContentData(selectedCourseId);
  }, [selectedCourseId]);

  function handleCourseSwitch(id: string) {
    onSelectCourse?.(id);
    loadContentData(id);
  }

  // ── Section handlers ───────────────────────────────────────────────────────

  async function handleAddSection() {
    if (!newSectionName.trim() || !course) return;
    setSectionLoading(true);
    try {
      const created: DbSection = await apiAdmin("/api/admin/sections", {
        method: "POST",
        body: JSON.stringify({ course_id: course.id, title: newSectionName.trim() }),
      });
      const newSec: Section = {
        id: created.id,
        courseId: created.course_id,
        title: created.title,
        order: created.order_number,
        published: true,
        lessons: [],
      };
      setSections((prev) => [...prev, newSec]);
      setExpandedSections((prev) => new Set([...prev, created.id]));
      setAddSectionModal(false);
      setNewSectionName("");
      setNewSectionDesc("");
      toast.success("Section created successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to create section");
    } finally {
      setSectionLoading(false);
    }
  }

  async function handleToggleSectionPublished(sectionId: string) {
    // Sections don't have a published flag in the DB — toggle locally only
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, published: !s.published } : s))
    );
    toast.success("Section visibility updated (UI only)");
  }

  // ── Lesson handlers ────────────────────────────────────────────────────────

  async function handlePreview(lessonId: string) {
    const section = sections.find(s => s.lessons?.some(l => l.id === lessonId));
    const lesson = section?.lessons?.find(l => l.id === lessonId);
    
    if (!lesson || (!lesson.videoId && !lesson.pdfUrl)) {
      toast.error("No media uploaded yet to preview.");
      return;
    }

    try {
      const res = await apiAdmin(`/api/admin/lessons/${lessonId}/preview`);
      setPreviewModal(res);
    } catch (err: any) {
      toast.error(err.message || "Preview not available");
    }
  }

  async function handleFileSelected(file: File) {
    const isPdf = file.name.toLowerCase().endsWith(".pdf") || file.type.includes("pdf");
    const isVideo = file.name.toLowerCase().match(/\.(mp4|mov)$/) || file.type.includes("video");

    if (newLessonType === "video" && isPdf) {
      toast.error("Please select the PDF tab to upload documents.");
      return;
    }
    if (newLessonType === "pdf" && isVideo) {
      toast.error("Please select the Video tab to upload videos.");
      return;
    }

    if (!newLessonTitle.trim()) {
      toast.error("Please enter a lesson title first.");
      return;
    }
    
    setSelectedFile(file);
    setUploadStage("uploading");
    setUploadProgress(0);
    setLessonLoading(true);

    try {
      let targetLessonId = addLessonModal?.lessonId;

      if (!targetLessonId && addLessonModal) {
        // Create lesson placeholder
        const created: DbLesson = await apiAdmin("/api/admin/lessons", {
          method: "POST",
          body: JSON.stringify({
            section_id: addLessonModal.sectionId,
            title: newLessonTitle.trim(),
            description: newLessonDesc.trim() || undefined,
            status: "published",
            video_id: newLessonType === "video" ? "00000000-0000-4000-8000-000000000000" : null,
            pdf_url: newLessonType === "pdf" ? "https://nytrc.in/empty.pdf" : null,
          }),
        });
        targetLessonId = created.id;
        setAddLessonModal({ sectionId: addLessonModal.sectionId, lessonId: targetLessonId });
        
        const newLesson = { ...toUiLesson(created), published: true, status: 'published' as const };
        setSections((prev) =>
          prev.map((s) =>
            s.id === addLessonModal.sectionId
              ? { ...s, lessons: [...(s.lessons || []), newLesson] }
              : s
          )
        );
      }

      if (!targetLessonId) throw new Error("No target lesson");

      const endpoint = newLessonType === "video" ? "/api/admin/upload/video" : "/api/admin/upload/document";
      const ticketRes = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: targetLessonId,
          title: newLessonTitle,
          filename: file.name,
          contentType: file.type || "application/octet-stream"
        })
      });

      if (!ticketRes.ok) {
        const errData = await ticketRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to get upload ticket");
      }
      
      const ticket = await ticketRes.json();
      
      // Direct Upload via XHR
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const uploadUrl = ticket.uploadUrl;
          
        xhr.open("PUT", uploadUrl, true);
        
        if (newLessonType === "video") {
          xhr.setRequestHeader("AccessKey", ticket.accessKey);
          xhr.setRequestHeader("Content-Type", "application/octet-stream");
        } else {
          xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        }

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const p = Math.round((e.loaded * 100) / e.total);
            setUploadProgress(p);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.responseText);
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(file);
      });

      if (newLessonType === "video") {
        setNewLessonVideoId(ticket.videoId);
      } else {
        setNewLessonPdfUrl(ticket.key || ticket.url || "");
      }
      
      setUploadStage("published");
    } catch (err: any) {
      console.error("[Upload] error:", err);
      toast.error(err.message || "Failed to upload file");
      setUploadStage("failed");
    } finally {
      setLessonLoading(false);
    }
  }

  async function handleAddLesson() {
    if (!newLessonTitle.trim() || !addLessonModal) return;

    setLessonLoading(true);
    let targetLessonId = addLessonModal.lessonId;
    let finalVideoId = newLessonType === "video" ? (newLessonVideoId.trim() || "00000000-0000-4000-8000-000000000000") : null;
    let finalPdfUrl = newLessonType === "pdf" ? (newLessonPdfUrl.trim() || "https://nytrc.in/empty.pdf") : null;

    try {
      if (!targetLessonId) {
        // 1. Create target lesson if not editing
        const created: DbLesson = await apiAdmin("/api/admin/lessons", {
          method: "POST",
          body: JSON.stringify({
            section_id: addLessonModal.sectionId,
            title: newLessonTitle.trim(),
            description: newLessonDesc.trim() || undefined,
            status: "published",
            video_id: finalVideoId,
            pdf_url: finalPdfUrl,
          }),
        });
        const newLesson = { ...toUiLesson(created), published: true, status: 'published' as const };
        setSections((prev) =>
          prev.map((s) =>
            s.id === addLessonModal.sectionId
              ? { ...s, lessons: [...(s.lessons || []), newLesson] }
              : s
          )
        );
        toast.success("Lesson created successfully.");
      } else {
        // 2. Final update to lesson
        const updated: DbLesson = await apiAdmin(`/api/admin/lessons/${targetLessonId}`, {
          method: "PUT",
          body: JSON.stringify({
            title: newLessonTitle.trim(),
            description: newLessonDesc.trim() || undefined,
            video_id: finalVideoId,
            pdf_url: finalPdfUrl,
          }),
        });
        const updatedLesson = toUiLesson(updated);
        setSections((prev) =>
          prev.map((s) =>
            s.id === addLessonModal.sectionId
              ? {
                  ...s,
                  lessons: s.lessons?.map((l) =>
                    l.id === targetLessonId ? { ...updatedLesson, published: true, status: 'published' } : l
                  ),
                }
              : s
          )
        );
        toast.success("Lesson saved successfully.");
      }

      setAddLessonModal(null);
      setNewLessonTitle("");
      setNewLessonDesc("");
      setNewLessonVideoId("");
      setNewLessonPdfUrl("");
      setSelectedFile(null);
    } catch (err: any) {
      console.error("[handleAddLesson] error:", err);
      toast.error("Save failed: " + (err.message || "Unknown error"));
    } finally {
      setLessonLoading(false);
    }
  }

  // Draft mode removed — all lessons are published by default.
  // handleToggleLessonPublished has been intentionally deleted.

  async function handleToggleDownloadPermission(sectionId: string, lessonId: string) {
    const section = sections.find((s) => s.id === sectionId);
    const lesson = section?.lessons?.find((l) => l.id === lessonId);
    if (!lesson) return;

    const newValue = !lesson.downloadPermission;
    try {
      await apiAdmin(`/api/admin/lessons/${lessonId}`, {
        method: "PUT",
        body: JSON.stringify({ allow_download: newValue }),
      });
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                lessons: s.lessons?.map((l) =>
                  l.id === lessonId
                    ? { ...l, downloadPermission: newValue, hasDownload: newValue }
                    : l
                ),
              }
            : s
        )
      );
      toast.success("Download permission updated");
    } catch (err: any) {
      toast.error("Failed to update download permission");
    }
  }

  async function promptDeleteLesson(sectionId: string, lessonId: string, title: string) {
    let progressCount = 0;
    try {
      const res = await apiAdmin(`/api/admin/lessons/${lessonId}/progress-check`);
      progressCount = res.progressCount || 0;
    } catch {}
    setDeleteTarget({ sectionId, lessonId, title, progressCount });
  }

  async function handleReorderLesson(sectionId: string, lessonId: string, direction: "up" | "down") {
    const section = sections.find((s) => s.id === sectionId);
    if (!section || !section.lessons) return;

    const lessons = [...section.lessons];
    const index = lessons.findIndex((l) => l.id === lessonId);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= lessons.length) return;

    const [moved] = lessons.splice(index, 1);
    lessons.splice(newIndex, 0, moved);

    const orderedIds = lessons.map((l) => l.id);
    try {
      await apiAdmin(`/api/admin/sections/${sectionId}/lessons/reorder`, {
        method: "POST",
        body: JSON.stringify({ orderedIds }),
      });
      setSections((prev) =>
        prev.map((s) => (s.id === sectionId ? { ...s, lessons } : s))
      );
      toast.success("Lesson order updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to reorder lessons");
    }
  }

  async function handleDeleteLesson() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await apiAdmin(`/api/admin/lessons/${deleteTarget.lessonId}`, { method: "DELETE" });
      setSections((prev) =>
        prev.map((s) =>
          s.id === deleteTarget.sectionId
            ? { ...s, lessons: s.lessons?.filter((l) => l.id !== deleteTarget.lessonId) }
            : s
        )
      );
      setDeleteTarget(null);
      toast.success("Lesson deleted");
    } catch (err: any) {
      toast.error("Failed to delete lesson");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handlePublishCourse() {
    if (!course) return;
    setPublishState("publishing");
    try {
      const updated: DbCourse = await apiAdmin(`/api/admin/courses/${course.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "published" }),
      });
      setCourse((prev) => (prev ? { ...prev, status: updated.status } : null));
      setPublishState("published");
      toast.success("Course published successfully — now visible to students!");
    } catch (err: any) {
      setPublishState("idle");
      toast.error(err.message || "Failed to publish course");
    }
  }

  async function handleDeleteCourse() {
    if (!course) return;
    setDeleteCourseLoading(true);
    try {
      await apiAdmin(`/api/admin/courses/${course.id}`, { method: "DELETE" });
      setDeleteCourseModal(false);
      toast.success("Course deleted successfully");
      onNavigate?.("admin-dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete course");
    } finally {
      setDeleteCourseLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <div className="mb-4">
            <Breadcrumb items={[{ label: "Admin" }, { label: "Content Editor" }]} />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 sm:mb-8">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Content Editor</h1>
              {allCourses.length > 1 ? (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-semibold">Select course:</span>
                  <select
                    value={course?.id || ""}
                    onChange={(e) => handleCourseSwitch(e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    {allCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.status})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm mt-1 truncate">
                  {course?.title || "No courses found"}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button variant="secondary" onClick={() => setAddSectionModal(true)}>
                <Plus className="w-4 h-4" />
                Add section
              </Button>
              <Button onClick={() => setPublishModal(true)} disabled={course?.status === "published"}>
                <CheckCircle2 className="w-4 h-4" />
                {course?.status === "published" ? "Course Published" : "Publish Course"}
              </Button>
              <Button variant="destructive" onClick={() => setDeleteCourseModal(true)}>
                <Trash2 className="w-4 h-4" />
                Delete Course
              </Button>
            </div>
          </div>

          {/* Course Container Card */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-3 min-w-0">
                <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm font-bold text-foreground truncate">{course?.title}</span>
              </div>
              <Badge variant={course?.status || "draft"} />
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading sections and lessons...</p>
              </div>
            ) : sections.length === 0 ? (
              <div className="p-8 text-center border-b border-border">
                <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm font-bold text-foreground">No sections created yet</p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Create a section first before lessons can be added.
                </p>
                <Button size="sm" onClick={() => setAddSectionModal(true)}>
                  <Plus className="w-3.5 h-3.5" />
                  Add first section
                </Button>
              </div>
            ) : (
              sections.map((section) => {
                const expanded = expandedSections.has(section.id);
                const lessons = section.lessons || [];

                return (
                  <div key={section.id} className="border-b border-border last:border-0">
                    <div className="flex items-center gap-2 px-5 py-3.5 hover:bg-muted/20 transition-colors group">
                      <GripVertical className="w-4 h-4 text-muted-foreground/30 cursor-grab flex-shrink-0 hidden sm:block" />
                      <button
                        onClick={() =>
                          setExpandedSections((prev) => {
                            const n = new Set(prev);
                            n.has(section.id) ? n.delete(section.id) : n.add(section.id);
                            return n;
                          })
                        }
                        className="flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer"
                      >
                        {expanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className="text-sm font-bold text-foreground truncate">{section.title}</span>
                        <span className="text-xs text-muted-foreground ml-1 flex-shrink-0 font-medium">({lessons.length})</span>
                      </button>
                      <button
                        onClick={() => handleToggleSectionPublished(section.id)}
                        className={cn(
                          "ml-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors border flex-shrink-0 cursor-pointer",
                          section.published
                            ? "bg-success-light text-success-foreground border-success/20 hover:bg-success-light/80"
                            : "bg-warning-light text-warning-foreground border-warning/20 hover:bg-warning-light/80"
                        )}
                      >
                        {section.published ? "Published" : "Draft"}
                      </button>
                    </div>

                    {expanded && (
                      <div className="bg-muted/10">
                        {lessons.length === 0 ? (
                          <div className="pl-12 pr-5 py-3 border-t border-border/50 text-xs text-muted-foreground flex items-center justify-between">
                            <span>No lessons in this section. Add a lesson first before uploading media.</span>
                            <button
                              onClick={() => {
                                setAddLessonModal({ sectionId: section.id });
                                setNewLessonType("video");
                              }}
                              className="text-primary font-bold hover:underline cursor-pointer"
                            >
                              + Add Lesson
                            </button>
                          </div>
                        ) : (
                          lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-2 pl-12 pr-5 py-3 border-t border-border/50 hover:bg-muted/20 transition-colors group/l"
                            >
                              <GripVertical className="w-3.5 h-3.5 text-muted-foreground/20 cursor-grab flex-shrink-0 hidden sm:block" />
                              {lesson.type === "pdf" ? (
                                <FileText className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              ) : (
                                <Play className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              )}
                              <span className="flex-1 text-sm font-semibold text-foreground truncate">{lesson.title}</span>
                              <span className="text-xs text-muted-foreground font-semibold flex-shrink-0 hidden sm:block">
                                {lesson.type.toUpperCase()}
                              </span>

                              {lesson.type === "pdf" && (
                                <button
                                  onClick={() => handleToggleDownloadPermission(section.id, lesson.id)}
                                  title={lesson.downloadPermission ? "Disable download" : "Enable download"}
                                  className={cn(
                                    "px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors flex-shrink-0 hidden sm:flex items-center gap-1 cursor-pointer",
                                    lesson.downloadPermission
                                      ? "bg-success-light text-success-foreground border-success/20 hover:bg-success-light/80"
                                      : "bg-muted text-muted-foreground border-border hover:bg-warning-light hover:text-warning-foreground"
                                  )}
                                >
                                  <Download className="w-3 h-3" />
                                  {lesson.downloadPermission ? "DL on" : "DL off"}
                                </button>
                              )}

                              <div className="flex items-center gap-1 transition-opacity flex-shrink-0">
                                <button
                                  onClick={() => {
                                    setAddLessonModal({ sectionId: section.id, lessonId: lesson.id });
                                    setNewLessonTitle(lesson.title);
                                    setNewLessonDesc(lesson.description || "");
                                    setNewLessonType(lesson.type);
                                    setNewLessonVideoId(lesson.videoId === "pending" ? "" : (lesson.videoId || ""));
                                    setNewLessonPdfUrl(lesson.pdfUrl || "");
                                    setSelectedFile(null);
                                    setUploadStage("idle");
                                  }}
                                  title="Edit Lesson"
                                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-xs text-primary font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                  <FileText className="w-3 h-3" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handlePreview(lesson.id)}
                                  title="Preview Lesson"
                                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-xs text-primary font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                  <Play className="w-3 h-3" />
                                  Preview
                                </button>
                                <button
                                  onClick={() => promptDeleteLesson(section.id, lesson.id, lesson.title)}
                                  title="Delete lesson"
                                  className="p-1.5 rounded-lg hover:bg-error-light transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3 text-destructive" />
                                </button>
                              </div>
                              {/* Static Published badge — draft mode removed */}
                              <span className="ml-1 px-2.5 py-0.5 rounded-md text-xs font-bold border flex-shrink-0 bg-success-light text-success-foreground border-success/20">
                                {(lesson.videoId || lesson.pdfUrl) ? "Published" : "No media"}
                              </span>
                            </div>
                          ))
                        )}

                        <div className="pl-12 pr-5 py-3 border-t border-border/50 flex items-center gap-3">
                          <button
                            onClick={() => {
                              setAddLessonModal({ sectionId: section.id });
                              setNewLessonType("video");
                            }}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-bold cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add lesson
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            <div className="px-5 py-4 flex items-center justify-between gap-3 bg-muted/10">
              <button
                onClick={() => setAddSectionModal(true)}
                className="flex items-center gap-2 text-sm text-primary font-bold hover:underline cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add section
              </button>
              <button
                onClick={() => loadContentData(course?.id)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Lesson Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteLesson}
        loading={deleteLoading}
        title="Delete lesson?"
        description={`This will permanently remove "${deleteTarget?.title}" and its media file.`}
        warning={
          deleteTarget?.progressCount && deleteTarget.progressCount > 0
            ? `Warning: ${deleteTarget.progressCount} student(s) have recorded progress for this lesson. Deleting it will permanently clear their progress records.`
            : "Students with progress on this lesson will lose that record."
        }
        confirmText="Delete lesson"
        variant="destructive"
      />

      {/* Add Section modal */}
      <Modal
        open={addSectionModal}
        onClose={() => { setAddSectionModal(false); setNewSectionName(""); setNewSectionDesc(""); }}
        title="Add section"
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setAddSectionModal(false)}>Cancel</Button>
            <Button size="sm" loading={sectionLoading} disabled={!newSectionName.trim()} onClick={handleAddSection}>
              Add section
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <FormInput
            label="Section name"
            placeholder="e.g. Getting Started"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Brief description of this section"
              value={newSectionDesc}
              onChange={(e) => setNewSectionDesc(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
        </div>
      </Modal>

      {/* Add/Edit Lesson modal */}
      <Modal
        open={!!addLessonModal}
        onClose={() => { 
          if (lessonLoading || uploadStage === "uploading") return;
          setAddLessonModal(null); 
          setNewLessonTitle(""); 
          setNewLessonDesc(""); 
          setNewLessonVideoId(""); 
          setNewLessonPdfUrl(""); 
          setSelectedFile(null);
          setUploadStage("idle");
        }}
        title={addLessonModal?.lessonId ? "Edit lesson" : "Add lesson"}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => {
              if (lessonLoading || uploadStage === "uploading") return;
              setAddLessonModal(null);
              setSelectedFile(null);
              setUploadStage("idle");
            }}>Cancel</Button>
            <Button size="sm" loading={lessonLoading} disabled={!newLessonTitle.trim() || uploadStage === "uploading"} onClick={handleAddLesson}>
              {addLessonModal?.lessonId ? "Save changes" : "Add lesson"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <FormInput
            label="Lesson title"
            placeholder="e.g. Introduction to Closures"
            value={newLessonTitle}
            onChange={(e) => setNewLessonTitle(e.target.value)}
            disabled={uploadStage === "uploading"}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="What will students learn in this lesson?"
              value={newLessonDesc}
              onChange={(e) => setNewLessonDesc(e.target.value)}
              disabled={uploadStage === "uploading"}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Content type</label>
            <div className="flex gap-3">
              {(["video", "pdf"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setNewLessonType(t)}
                  disabled={uploadStage === "uploading"}
                  className={cn(
                    "flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-bold transition-all",
                    newLessonType === t
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30 cursor-pointer",
                    uploadStage === "uploading" && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {t === "video" ? <Play className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  {t === "video" ? "Video" : "PDF"}
                </button>
              ))}
            </div>
          </div>
          {newLessonType === "video" && uploadStage === "idle" && (
            <div className="flex flex-col gap-2">
              <FormInput
                label="Video ID / URL"
                placeholder="e.g. YouTube URL or ID"
                value={newLessonVideoId}
                onChange={(e) => setNewLessonVideoId(e.target.value)}
              />
              <div className="text-center text-sm font-bold text-muted-foreground my-2">OR</div>
              <FileUpload
                hint="MP4, MOV — max 500 MB"
                onChange={handleFileSelected}
              />
            </div>
          )}
          {newLessonType === "pdf" && uploadStage === "idle" && (
            <div className="flex flex-col gap-2">
              <FormInput
                label="PDF URL"
                placeholder="e.g. https://example.com/file.pdf"
                value={newLessonPdfUrl}
                onChange={(e) => setNewLessonPdfUrl(e.target.value)}
              />
              <div className="text-center text-sm font-bold text-muted-foreground my-2">OR</div>
              <FileUpload
                hint="PDF — max 50 MB"
                onChange={handleFileSelected}
              />
            </div>
          )}
          
          {uploadStage !== "idle" && (
            <div className="mt-4 p-4 rounded-xl border border-border bg-muted/20">
              <UploadPipeline
                stage={uploadStage}
                progress={uploadProgress}
                filename={selectedFile?.name || "upload"}
                fileType={newLessonType === "video" || newLessonType === "pdf" ? newLessonType : undefined}
                onRetry={() => {
                  setUploadStage("idle");
                  setSelectedFile(null);
                }}
              />
            </div>
          )}
        </div>
      </Modal>

      {/* Publish Course modal */}
      <Modal
        open={publishModal}
        onClose={() => { if (publishState !== "publishing") setPublishModal(false); }}
        title="Publish course"
        actions={
          publishState === "published" ? (
            <Button size="sm" onClick={() => setPublishModal(false)}>Done</Button>
          ) : (
            <>
              <Button variant="secondary" size="sm" disabled={publishState === "publishing"} onClick={() => setPublishModal(false)}>
                Cancel
              </Button>
              <Button size="sm" loading={publishState === "publishing"} onClick={handlePublishCourse}>
                <CheckCircle2 className="w-4 h-4" />
                Publish now
              </Button>
            </>
          )
        }
      >
        {publishState === "published" ? (
          <div className="flex flex-col items-center text-center py-3 gap-3">
            <div className="w-12 h-12 rounded-full bg-success-light flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success-foreground" />
            </div>
            <div>
              <p className="font-bold text-foreground">Course published</p>
              <p className="text-sm text-muted-foreground mt-1">The course is now visible to enrolled students.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Publishing will make <strong className="text-foreground font-bold">{course?.title}</strong> visible to all enrolled students immediately.
            </p>
            <div className="flex items-start gap-2.5 px-3 py-2.5 bg-warning-light rounded-xl border border-warning/30">
              <AlertTriangle className="w-4 h-4 text-warning-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-warning-foreground leading-relaxed font-medium">
                Only published lessons will be visible. Ensure all content is ready before proceeding.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Course modal */}
      <ConfirmDialog
        isOpen={deleteCourseModal}
        onClose={() => setDeleteCourseModal(false)}
        onConfirm={handleDeleteCourse}
        loading={deleteCourseLoading}
        title="Delete course?"
        description={`This will permanently delete "${course?.title}" including all sections and lessons.`}
        warning="This action cannot be undone. All student progress records for this course will also be removed."
        confirmText="Delete course"
        variant="destructive"
      />
      {/* Preview Modal */}
      <Modal
        open={!!previewModal}
        onClose={() => setPreviewModal(null)}
        title="Content Preview"
        maxWidth="max-w-4xl"
        actions={<Button size="sm" onClick={() => setPreviewModal(null)}>Close</Button>}
      >
        <div className="w-full aspect-video rounded-xl overflow-hidden bg-black/5 flex items-center justify-center">
          {previewModal && previewModal.type === 'video' && (
            <iframe
              src={previewModal.url}
              className="w-full h-full border-0"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          )}
          {previewModal && previewModal.type === 'pdf' && (
            <iframe
              src={previewModal.url}
              className="w-full h-[80vh] border-0"
            />
          )}
        </div>
      </Modal>
    </AdminLayout>
  );
}
