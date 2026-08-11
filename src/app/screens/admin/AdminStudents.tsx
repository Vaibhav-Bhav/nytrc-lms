import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Download, Search, ArrowUpDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Screen, Student } from "../../../data/types";
import { lmsService } from "../../../services/lmsService";
import { AdminLayout } from "../../components/AdminLayout";
import { SearchInput } from "../../components/SearchInput";
import { ProgressBar } from "../../components/ProgressBar";
import { Badge } from "../../components/Badge";
import { Pagination } from "../../components/Pagination";
import { Button, cn } from "../../components/Button";

const PAGE_SIZE = 10;

export function AdminStudents({
  onNavigate,
  onSelectStudent,
}: {
  onNavigate?: (s: Screen) => void;
  onSelectStudent?: (id: string) => void;
}) {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("joined");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/students');
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setStudents(data);
      } catch (e) {
        console.error("Error fetching students:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  function handleSort(field: string) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(1);
  }

  function handleExportCsv() {
    if (students.length === 0) {
      toast.error("No student records available for CSV export.");
      return;
    }
    const headers = ["Name", "Email", "Mobile", "Joined", "Last Login", "Progress (%)", "Status"];
    const rows = students.map((s) => [
      `"${(s.name || "").replace(/"/g, '""')}"`,
      `"${s.email || ""}"`,
      `"${(s as any).mobile || ""}"`,
      `"${s.joined || ""}"`,
      `"${s.lastLogin || ""}"`,
      s.progress || 0,
      `"${s.status || "active"}"`,
    ]);
    const csvData = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `students_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Student list exported to CSV!");
  }

  const filtered = students
    .filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        ((s as any).mobile && String((s as any).mobile).includes(search))
    )
    .sort((a, b) => {
      const cmp = String((a as any)[sortField] ?? "").localeCompare(
        String((b as any)[sortField] ?? ""),
        undefined,
        { numeric: true }
      );
      return sortDir === "asc" ? cmp : -cmp;
    });

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function SortTh({ field, label, cls }: { field: string; label: string; cls?: string }) {
    const active = sortField === field;
    return (
      <th className={cn("text-left px-4 py-3.5 first:pl-5", cls)}>
        <button
          onClick={() => handleSort(field)}
          className={cn(
            "flex items-center gap-1 text-xs font-bold uppercase tracking-wider hover:text-foreground transition-colors cursor-pointer",
            active ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {label}
          <ArrowUpDown className={cn("w-3 h-3 flex-shrink-0", active ? "text-primary" : "text-muted-foreground/40")} />
        </button>
      </th>
    );
  }

  return (
    <AdminLayout>
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Students</h1>
              <p className="text-muted-foreground text-sm mt-1">{students.length} enrolled students</p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleExportCsv} className="flex-shrink-0 self-start">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>

          <div className="mb-6">
            <SearchInput
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by name, email, or mobile..."
            />
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <SortTh field="name" label="Name" cls="pl-5" />
                    <SortTh field="email" label="Email" cls="hidden md:table-cell" />
                    <SortTh field="mobile" label="Mobile" cls="hidden sm:table-cell" />
                    <SortTh field="joined" label="Joined" />
                    <SortTh field="lastLogin" label="Last login" cls="hidden lg:table-cell" />
                    <SortTh field="progress" label="Progress" />
                    <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3.5" />
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center">
                        <div className="w-8 h-8 mx-auto mb-3 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-sm text-muted-foreground">Loading students...</p>
                      </td>
                    </tr>
                  ) : paged.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center">
                        <Search className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                          {search ? `No students match "${search}"` : "No students found"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paged.map((student) => (
                      <tr
                        key={student.id}
                        className="border-t border-border hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => {
                          navigate({ to: `/admin/students/$studentId`, params: { studentId: student.id } });
                        }}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-primary">
                                {student.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate({ to: `/admin/students/$studentId`, params: { studentId: student.id } });
                              }}
                              className="text-sm font-bold text-foreground hover:text-primary transition-colors text-left whitespace-nowrap cursor-pointer"
                            >
                              {student.name}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-muted-foreground hidden md:table-cell">{student.email}</td>
                        <td className="px-4 py-3.5 text-sm text-muted-foreground hidden sm:table-cell font-mono text-xs">
                          {(student as any).mobile || "—"}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-muted-foreground whitespace-nowrap">{student.joined}</td>
                        <td className="px-4 py-3.5 text-sm text-muted-foreground whitespace-nowrap hidden lg:table-cell">
                          {student.lastLogin}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 sm:w-20">
                              <ProgressBar value={student.progress} color={student.progress >= 75 ? "green" : "primary"} />
                            </div>
                            <span className="text-xs font-bold text-muted-foreground tabular-nums">{student.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={student.status} />
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <ChevronRight className="w-4 h-4 text-muted-foreground inline" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}
