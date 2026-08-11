import { useState, useEffect } from "react";
import { Search, ArrowLeft, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Screen } from "../../../data/types";
import { EMAIL_LOG as MOCK_EMAIL_LOG } from "../../../data/mockData";
import { AdminLayout } from "../../components/AdminLayout";
import { SearchInput } from "../../components/SearchInput";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";

interface ApiEmailLog {
  id: string;
  user_id?: string | null;
  recipient_name: string;
  to_address: string;
  template: string;
  subject?: string | null;
  status: "pending" | "sent" | "failed" | "delivered";
  provider_message_id?: string | null;
  error?: string | null;
  sent_at?: string | null;
  created_at: string;
}

export function AdminEmailLog({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState<ApiEmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [resendingId, setResendingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/email-log", { credentials: "include" });
        if (res.ok) {
          const data: ApiEmailLog[] = await res.json();
          setLogs(data);
        } else {
          // Fallback to mock data
          setLogs(
            MOCK_EMAIL_LOG.map((m) => ({
              id: m.id,
              recipient_name: "Student",
              to_address: "student@example.com",
              template: m.type,
              status: m.status as any,
              created_at: m.sent,
            }))
          );
        }
      } catch {
        setLogs(
          MOCK_EMAIL_LOG.map((m) => ({
            id: m.id,
            recipient_name: "Student",
            to_address: "student@example.com",
            template: m.type,
            status: m.status as any,
            created_at: m.sent,
          }))
        );
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  async function handleResend(logId: string, template: string) {
    setResendingId(logId);
    try {
      const res = await fetch("/api/admin/email-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ log_id: logId }),
      });
      if (res.ok) {
        toast.success(`Resent ${template} email successfully`);
        // Refresh logs
        const refreshRes = await fetch("/api/admin/email-log", { credentials: "include" });
        if (refreshRes.ok) setLogs(await refreshRes.json());
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to resend email");
      }
    } catch {
      toast.error("Network error when attempting to resend email");
    } finally {
      setResendingId(null);
    }
  }

  const filtered = logs.filter(
    (l) =>
      l.template.toLowerCase().includes(search.toLowerCase()) ||
      l.to_address.toLowerCase().includes(search.toLowerCase()) ||
      l.recipient_name.toLowerCase().includes(search.toLowerCase()) ||
      l.created_at.includes(search)
  );

  return (
    <AdminLayout>
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate?.("admin-dashboard")}
                className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Email Delivery Log</h1>
                <p className="text-muted-foreground text-sm mt-0.5">Audit log of system notifications sent to students</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by recipient, template, or timestamp..." />
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Recipient
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Email Template
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Sent Time
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Delivery Status
                    </th>
                    <th className="text-right px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <span className="text-sm">Loading email audit logs...</span>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center">
                        <Search className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No email logs found matching filter</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((entry) => (
                      <tr key={entry.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="text-sm font-bold text-foreground">{entry.recipient_name}</p>
                            <p className="text-xs text-muted-foreground">{entry.to_address}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm font-semibold text-foreground capitalize">
                          {entry.template.replace("_", " ")}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(entry.created_at).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={entry.status === "sent" ? "delivered" : entry.status === "failed" ? "failed" : "pending"} />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            loading={resendingId === entry.id}
                            onClick={() => handleResend(entry.id, entry.template)}
                          >
                            <Send className="w-3.5 h-3.5" />
                            Resend
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}
