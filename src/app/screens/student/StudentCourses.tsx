import { useState, useEffect } from "react";
import { BookOpen, Play, Search, Layers, FileText, CheckCircle2, Clock } from "lucide-react";
import { Screen, Course } from "../../../data/types";
import { lmsService } from "../../../services/lmsService";
import { StudentNav } from "../../components/StudentNav";
import { Breadcrumb } from "../../components/Breadcrumb";
import { SearchInput } from "../../components/SearchInput";
import { Button } from "../../components/Button";
import { ProgressBar } from "../../components/ProgressBar";
import { Badge } from "../../components/Badge";

export function StudentCourses({
  onNavigate,
  onSelectCourse,
}: {
  onNavigate: (s: Screen) => void;
  onSelectCourse?: (id: string) => void;
}) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      const data = await lmsService.getCourses();
      setCourses(data);
      setLoading(false);
    }
    loadCourses();
  }, []);

  function handleSelectCourseCard(id: string, screen: "student-course-detail" | "course-player") {
    onSelectCourse?.(id);
    onNavigate(screen);
  }

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <StudentNav current="student-courses" onNavigate={onNavigate}>
      <main className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full">
        <div className="mb-4">
          <Breadcrumb
            items={[
              { label: "Dashboard", onClick: () => onNavigate("student-dashboard") },
              { label: "My Courses" },
            ]}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">My Courses</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Select a course to view its curriculum, lessons, and video content.
            </p>
          </div>
          <div className="w-full sm:w-72">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search courses by title or instructor..."
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse space-y-3">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-16 bg-muted/60 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground text-base">No courses found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {search ? `No courses matching "${search}"` : "No published courses available."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {filtered.map((c) => {
              const isPrimary = c.id === "c1";
              const pct = isPrimary ? 60 : 0;

              return (
                <div
                  key={c.id}
                  className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col hover:border-primary/40 transition-colors"
                >
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <Badge variant={c.status} />
                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5" />
                          {c.sectionCount || 0} sections · {c.lessonCount || 0} lessons
                        </span>
                      </div>
                      <h2 className="text-base font-semibold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer" onClick={() => handleSelectCourseCard(c.id, "student-course-detail")}>
                        {c.title}
                      </h2>
                      <p className="text-xs font-medium text-muted-foreground mt-1">{c.instructor}</p>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-3">
                        {c.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-border/60">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground font-medium">Progress</span>
                        <span className="font-semibold text-foreground">{pct}%</span>
                      </div>
                      <ProgressBar value={pct} color="primary" />
                    </div>
                  </div>

                  <div className="px-5 sm:px-6 py-3.5 bg-muted/20 border-t border-border flex items-center justify-between gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSelectCourseCard(c.id, "student-course-detail")}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      View Outline
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
    </StudentNav>
  );
}
