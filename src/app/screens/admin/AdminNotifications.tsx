import { useState, useEffect } from "react";
import { Bell, CheckCheck, Sparkles, UserPlus, CreditCard, BookOpen, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "../../components/AdminLayout";
import { SearchInput } from "../../components/SearchInput";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { useNavigate } from "@tanstack/react-router";

interface NotificationItem {
  id: string;
  user_id?: string | null;
  target_role?: string | null;
  title: string;
  message: string;
  type: "course_update" | "invoice_paid" | "welcome" | "new_enrollment" | "system";
  link?: string | null;
  is_read: boolean;
  created_at: string;
}

export function AdminNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  async function fetchNotifications() {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to fetch admin notifications:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function handleMarkAllAsRead() {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        credentials: "include",
      });
      if (res.ok) {
        toast.success("All notifications marked as read");
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  }

  const filtered = notifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || n.type === filterType;
    return matchesSearch && matchesType;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  function getNotificationIcon(type: NotificationItem["type"]) {
    switch (type) {
      case "new_enrollment":
        return <UserPlus className="w-4 h-4 text-primary" />;
      case "invoice_paid":
        return <CreditCard className="w-4 h-4 text-success-foreground" />;
      case "course_update":
        return <BookOpen className="w-4 h-4 text-info-foreground" />;
      case "welcome":
        return <Sparkles className="w-4 h-4 text-warning-foreground" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  }

  function formatTimeAgo(isoString: string) {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <AdminLayout>
      <main className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">System Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Real-time activity logs for student enrollments, payments, and system updates.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline" size="sm" className="gap-2">
              <CheckCheck className="w-4 h-4 text-primary" />
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border">
          <div className="w-full sm:w-72">
            <SearchInput value={search} onChange={setSearch} placeholder="Filter notifications..." />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {["all", "new_enrollment", "invoice_paid", "course_update"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                  filterType === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {type.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Notification List */}
        <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading notifications...</div>
          ) : filtered.length > 0 ? (
            <div className="divide-y divide-border">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.link) navigate({ to: item.link as "/" });
                  }}
                  className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer hover:bg-muted/50 ${
                    !item.is_read ? "bg-muted/20" : ""
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-muted shrink-0 flex items-center justify-center">
                    {getNotificationIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        {!item.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                        {item.title}
                      </h4>
                      <span className="text-xs text-muted-foreground shrink-0">{formatTimeAgo(item.created_at)}</span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">{item.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground space-y-2">
              <Bell className="w-8 h-8 mx-auto text-muted-foreground/50" />
              <p className="text-sm font-semibold">No notifications found</p>
              <p className="text-xs text-muted-foreground">System updates and student actions will appear here.</p>
            </div>
          )}
        </div>
      </main>
    </AdminLayout>
  );
}
