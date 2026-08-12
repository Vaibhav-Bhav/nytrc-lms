import { useState } from "react";
import { Bell, Check, X, BookOpen, Receipt, ShieldAlert, Sparkles, Trash2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { cn } from "./Button";

export type NotificationItem = {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type: "course" | "invoice" | "security" | "system";
  link?: string;
};

const INITIAL_NOTIFS: NotificationItem[] = [
  {
    id: "n1",
    title: "Course Updated",
    desc: "Module 3: Fleet Safety Management has added new video content and lesson PDF documents.",
    time: "10 minutes ago",
    read: false,
    type: "course",
    link: "/student/courses",
  },
  {
    id: "n2",
    title: "GST Invoice Generated",
    desc: "Receipt #INV-2026-004 for React & Next.js Mastery generated successfully.",
    time: "1 hour ago",
    read: false,
    type: "invoice",
    link: "/student/account?tab=invoices",
  },
  {
    id: "n3",
    title: "Active Device Session",
    desc: "New login session recorded on Windows 11 (Chrome Browser).",
    time: "3 hours ago",
    read: false,
    type: "security",
    link: "/device-limit",
  },
  {
    id: "n4",
    title: "Welcome to NYTRC LMS",
    desc: "Your student enrollment is active. Explore your dashboard and learning paths.",
    time: "1 day ago",
    read: true,
    type: "system",
    link: "/student/dashboard",
  },
];

export function NotificationModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [items, setItems] = useState<NotificationItem[]>(INITIAL_NOTIFS);

  if (!isOpen) return null;

  const unreadCount = items.filter((i) => !i.read).length;

  function handleMarkAllRead() {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    toast.success("All notifications marked as read");
  }

  function handleClearAll() {
    setItems([]);
    toast.success("Notification list cleared");
  }

  function handleItemClick(item: NotificationItem) {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, read: true } : i))
    );
    onClose();
    if (item.link) {
      navigate({ to: item.link as "/" });
    }
  }

  function handleRemoveItem(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function renderIcon(type: NotificationItem["type"]) {
    switch (type) {
      case "course":
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case "invoice":
        return <Receipt className="w-4 h-4 text-emerald-500" />;
      case "security":
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-500" />;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Close notifications modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar */}
        {items.length > 0 && (
          <div className="px-5 py-2.5 border-b border-border/60 bg-muted/10 flex items-center justify-between text-xs">
            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="text-primary hover:underline font-medium disabled:opacity-50 disabled:no-underline cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Mark all as read
            </button>
            <button
              onClick={handleClearAll}
              className="text-muted-foreground hover:text-destructive font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear all
            </button>
          </div>
        )}

        {/* Notification list */}
        <div className="divide-y divide-border overflow-y-auto flex-1 p-2 space-y-1">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={cn(
                "p-3.5 rounded-xl transition-all cursor-pointer group flex items-start gap-3 relative",
                item.read
                  ? "bg-card hover:bg-muted/40 text-muted-foreground"
                  : "bg-primary/5 border border-primary/10 hover:bg-primary/10 text-foreground"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5",
                  item.read ? "bg-muted" : "bg-card shadow-xs"
                )}
              >
                {renderIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className={cn(
                      "text-xs font-bold truncate",
                      item.read ? "text-foreground/80" : "text-foreground"
                    )}
                  >
                    {item.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {item.time}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {item.desc}
                </p>
              </div>

              <button
                onClick={(e) => handleRemoveItem(e, item.id)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive hover:bg-muted rounded-lg transition-all"
                title="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {items.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
              <Bell className="w-8 h-8 text-muted-foreground/40" />
              <p>No notifications available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
