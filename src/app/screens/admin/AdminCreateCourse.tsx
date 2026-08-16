import React, { useState } from "react";
import { ArrowLeft, BookOpen, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Screen } from "../../../data/types";
import { AdminLayout } from "../../components/AdminLayout";
import { Breadcrumb } from "../../components/Breadcrumb";
import { FormInput } from "../../components/FormInput";
import { FileUpload } from "../../components/FileUpload";
import { Button, cn } from "../../components/Button";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";

export function AdminCreateCourse({
  onNavigate,
  onSelectCourse,
}: {
  onNavigate?: (s: Screen) => void;
  onSelectCourse?: (id: string) => void;
}) {
  const { data: user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("999");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [thumbnailName, setThumbnailName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; description?: string; price?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!title.trim()) e.title = "Course title is required.";
    if (!description.trim()) e.description = "Course description is required.";
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) e.price = "Price must be a non-negative number.";
    return e;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    if (!user?.id) {
      toast.error("You must be logged in as an admin to create a course.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          status: status.toLowerCase(),
          price: Number(price) || 0,
          created_by: user.id,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('Backend 400 Error Details:', errData);
        throw new Error(errData.message || errData.error || `Server error ${res.status}`);
      }

      const created = await res.json();
      setLoading(false);
      if (onSelectCourse) {
        onSelectCourse?.(created.id);
      }
      toast.success("Course created — add sections and lessons now.");
      navigate({ to: '/admin/content' });
    } catch (err: any) {
      setLoading(false);
      console.error("Course creation failed:", err);
      toast.error(err.message || "Failed to create course");
    }
  }

  return (
    <AdminLayout>
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <div className="mb-4">
            <Breadcrumb
              items={[
                { label: "Admin" },
                { label: "Dashboard", onClick: () => onNavigate?.("admin-dashboard") },
                { label: "Create Course" },
              ]}
            />
          </div>

          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <button
              onClick={() => onNavigate?.("admin-dashboard")}
              className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Create course</h1>
          </div>

          <form onSubmit={handleCreate} className="max-w-2xl flex flex-col gap-6">
            {/* Basic info */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-5 sm:p-6">
              <h2 className="font-bold text-foreground text-base mb-4">Course information</h2>
              <div className="flex flex-col gap-4">
                <FormInput
                  label="Course title"
                  placeholder="e.g. Modern JavaScript: From Fundamentals to Advanced"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors((prev) => ({ ...prev, title: undefined }));
                  }}
                  error={errors.title}
                  required
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground">Description</label>
                  <textarea
                    rows={4}
                    placeholder="What will students learn? Describe the course content and outcome."
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setErrors((prev) => ({ ...prev, description: undefined }));
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-sm rounded-lg border bg-card placeholder:text-muted-foreground resize-none",
                      "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors",
                      errors.description ? "border-destructive" : "border-border"
                    )}
                  />
                  {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                </div>
                <FormInput
                  label="Price (₹)"
                  type="number"
                  placeholder="999"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    setErrors((prev) => ({ ...prev, price: undefined }));
                  }}
                  error={errors.price}
                />
              </div>
            </div>

            {/* Thumbnail */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-5 sm:p-6">
              <h2 className="font-bold text-foreground text-base mb-1">Course thumbnail</h2>
              <p className="text-sm text-muted-foreground mb-4">Recommended: 1280×720px JPG or PNG.</p>
              {thumbnailName ? (
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-foreground truncate">{thumbnailName}</span>
                  <button
                    type="button"
                    onClick={() => setThumbnailName(null)}
                    className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <FileUpload hint="JPG, PNG — max 5 MB" onChange={(f) => setThumbnailName(f.name)} />
              )}
            </div>

            {/* Status */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-5 sm:p-6">
              <h2 className="font-bold text-foreground text-base mb-4">Publication status</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                {(["draft", "published"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={cn(
                      "flex-1 flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left cursor-pointer",
                      status === s ? "border-primary bg-primary/5 shadow-xs" : "border-border hover:border-primary/30"
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors",
                        status === s ? "border-primary" : "border-border"
                      )}
                    >
                      {status === s && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground capitalize">{s}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {s === "draft"
                          ? "Save as draft — not visible to students."
                          : "Immediately visible to enrolled students."}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" loading={loading} disabled={!title.trim()}>
                <Plus className="w-4 h-4" />
                Create course
              </Button>
              <Button type="button" variant="secondary" onClick={() => onNavigate?.("admin-dashboard")}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </AdminLayout>
  );
}
