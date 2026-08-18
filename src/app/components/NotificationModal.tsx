import { useState, useEffect } from "react";
import { Bell, Check, X, BookOpen, CreditCard, Sparkles, AlertCircle } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export interface ApiNotificationItem {
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

export function NotificationModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [items, setItems] = useState<ApiNotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  async function fetchNotifications() {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setItems(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const unreadCount = items.filter((i) => !i.is_read).length;

  async function handleMarkAllRead() {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        credentials: "include",
      });
      if (res.ok) {
        setItems((prev) => prev.map((i) => ({ ...i, is_read: true })));
        toast.success("All notifications marked as read");
      }
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  }

  function handleItemClick(item: ApiNotificationItem) {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_read: true } : i))
    );
    onClose();
    if (item.link) {
      navigate({ to: item.link as "/" });
    }
  }

  function renderIcon(type: ApiNotificationItem["type"]) {
    switch (type) {
      case "course_update":
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case "invoice_paid":
        return <CreditCard className="w-4 h-4 text-emerald-500" />;
      case "welcome":
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {unreadCount} unread
                  </span>
                )}
              </h3>
              <p className="text-xs text-muted-foreground">Your learning activity and course updates</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Close notifications"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        {items.length > 0 && unreadCount > 0 && (
          <div className="px-4 py-2 bg-muted/10 border-b border-border flex justify-end">
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Mark all as read
            </button>
          </div>
        )}

        {/* Body List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border p-2">
          {loading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Loading notifications...</div>
          ) : items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-3.5 rounded-xl transition-all cursor-pointer flex items-start gap-3.5 hover:bg-muted/60 ${
                  !item.is_read ? "bg-muted/30 font-medium" : ""
                }`}
              >
                <div className="p-2 rounded-xl bg-muted shrink-0 mt-0.5">
                  {renderIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      {!item.is_read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-muted-foreground shrink-0">{formatTimeAgo(item.created_at)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.message}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-muted-foreground space-y-2">
              <Bell className="w-8 h-8 mx-auto text-muted-foreground/40" />
              <p className="text-sm font-semibold">No notifications yet</p>
              <p className="text-xs text-muted-foreground">Course updates and account activity will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
