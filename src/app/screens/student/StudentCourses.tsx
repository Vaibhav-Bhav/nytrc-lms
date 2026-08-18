import { useState, useEffect } from "react";
import { BookOpen, Play, Layers } from "lucide-react";
import { Screen, Course } from "../../../data/types";
import { StudentLayout } from "../../components/StudentNav";
import { Breadcrumb } from "../../components/Breadcrumb";
import { SearchInput } from "../../components/SearchInput";
import { Button } from "../../components/Button";
import { ProgressBar } from "../../components/ProgressBar";
import { Badge } from "../../components/Badge";

const COURSE_IMG = "https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?w=900&h=500&fit=crop&auto=format";

export function StudentCourses({
  onNavigate,
  onSelectCourse,
}: {
  onNavigate?: (s: Screen) => void;
  onSelectCourse?: (id: string) => void;
}) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("q") || "";
    }
    return "";
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await fetch("/api/student/courses", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data = await res.json();
        
        const mapped: Course[] = data.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description || "",
          instructor: "Instructor", // Placeholder until instructor names are returned by API
          status: c.status,
          thumbnail: c.thumbnail_url || COURSE_IMG,
          progress: c.progress || 0,
          sectionCount: c.sectionCount || 0,
          lessonCount: c.lessonCount || 0,
        }));
        setCourses(mapped);
      } catch (err) {
        console.error("Failed to load student courses:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  function handleSelectCourseCard(id: string, screen: "student-course-detail" | "course-player") {
    onSelectCourse?.(id);
    onNavigate?.(screen);
  }

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <StudentLayout>
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-4">
          <Breadcrumb
            items={[
              { label: "Dashboard", onClick: () => onNavigate?.("student-dashboard") },
              { label: "My Courses" },
            ]}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">My Courses</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Select a course to view its curriculum, lessons, and video content.
            </p>
          </div>
          <div className="w-full sm:w-72">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search courses..."
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-6 animate-pulse space-y-3">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-16 bg-muted/60 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground text-base">No courses found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {search ? `No courses matching "${search}"` : "No published courses available."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {filtered.map((c) => {
              const pct = c.progress || 0;

              return (
                <div
                  key={c.id}
                  className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:border-primary/40 transition-all duration-200"
                >
                  <div className="relative h-40 overflow-hidden bg-muted">
                    <img
                      src={c.thumbnail || COURSE_IMG}
                      alt={c.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <Badge variant={c.status} />
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-primary" />
                          {c.sectionCount ?? 0} {c.sectionCount === 1 ? "section" : "sections"} · {c.lessonCount ?? 0} {c.lessonCount === 1 ? "lesson" : "lessons"}
                        </span>
                      </div>
                      <h2
                        className="text-base font-bold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer"
                        onClick={() => handleSelectCourseCard(c.id, "student-course-detail")}
                      >
                        {c.title}
                      </h2>
                      <p className="text-xs font-medium text-muted-foreground mt-1">{c.instructor}</p>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                        {c.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-border/60">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground font-medium">Progress</span>
                        <span className="font-bold text-foreground">{pct}%</span>
                      </div>
                      <ProgressBar value={pct} color="primary" />
                    </div>
                  </div>

                  <div className="px-5 py-3.5 bg-muted/30 border-t border-border flex items-center justify-between gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSelectCourseCard(c.id, "student-course-detail")}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Course Details
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSelectCourseCard(c.id, "course-player")}
                    >
                      <Play className="w-3.5 h-3.5" />
                      {pct > 0 ? "Continue" : "Start"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </StudentLayout>
  );
}
