import React, { useState } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Receipt,
  Bell,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  User,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { Screen } from "../../data/types";
import { cn } from "./Button";
import { Logo } from "./Logo";
import { DarkToggle } from "./DarkToggle";

export function StudentSidebar({
  current,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  onClose,
}: {
  current: Screen;
  onNavigate: (s: Screen) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onClose?: () => void;
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const MAIN_NAV = [
    { id: "student-dashboard" as Screen, label: "Dashboard", Icon: LayoutDashboard },
    { id: "student-courses" as Screen, label: "My Learning", Icon: GraduationCap },
    { id: "student-course-detail" as Screen, label: "Course", Icon: BookOpen },
    { id: "student-account" as Screen, label: "Invoices", Icon: Receipt },
  ];

  const SECONDARY_NAV = [
    {
      id: "notifications",
      label: "Notifications",
      Icon: Bell,
      action: () => toast.info("No new notifications"),
    },
    { id: "student-account" as Screen, label: "Settings", Icon: Settings },
  ];

  function isActive(id: string) {
    if (current === id) return true;
    if (id === "student-courses" && current === "student-courses") return true;
    if (id === "student-course-detail" && (current === "student-course-detail" || current === "course-player")) return true;
    if (id === "student-dashboard" && current === "student-dashboard") return true;
    return false;
  }

  function nav(s: Screen) {
    onNavigate(s);
    onClose?.();
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-card border-r border-border transition-all duration-250 ease-in-out overflow-hidden shadow-xs",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center h-16 border-b border-border flex-shrink-0 gap-3 px-4",
          collapsed && "justify-center px-0"
        )}
      >
        {!collapsed && <Logo />}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-xs">
            <span className="font-extrabold text-sm text-white">L</span>
          </div>
        )}
        {!collapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="ml-auto p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 cursor-pointer"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
        {onClose && !collapsed && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors md:hidden cursor-pointer">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Navigation list */}
      <nav className={cn("flex-1 overflow-y-auto py-4", collapsed ? "px-2" : "px-3")}>
        {collapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2.5 mb-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        {/* Main Section */}
        {!collapsed && (
          <p className="px-3 mb-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
            Main Navigation
          </p>
        )}
        <div className="flex flex-col gap-1">
          {MAIN_NAV.map(({ id, label, Icon }) => {
            const active = isActive(id);
            return (
              <button
                key={label}
                onClick={() => nav(id)}
                title={collapsed ? label : undefined}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl text-sm font-bold transition-all duration-150 text-left cursor-pointer",
                  collapsed ? "justify-center p-2.5" : "px-3 py-2.5",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                )}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-border/60" />

        {/* Secondary Section */}
        {!collapsed && (
          <p className="px-3 mb-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
            Preferences & Support
          </p>
        )}
        <div className="flex flex-col gap-1">
          {SECONDARY_NAV.map(({ id, label, Icon, action }) => {
            const active = isActive(id);
            return (
              <button
                key={label}
                onClick={() => (action ? action() : nav(id as Screen))}
                title={collapsed ? label : undefined}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl text-sm font-semibold transition-all duration-150 text-left cursor-pointer",
                  collapsed ? "justify-center p-2.5" : "px-3 py-2.5",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                )}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer / Bottom Profile Section */}
      <div className={cn("border-t border-border flex-shrink-0 py-3", collapsed ? "px-2" : "px-3")}>
        {!collapsed ? (
          <div className="px-3 py-1 mb-2">
            <DarkToggle label />
          </div>
        ) : (
          <div className="flex justify-center py-1 mb-2">
            <DarkToggle />
          </div>
        )}

        <button
          onClick={() => nav("login")}
          title={collapsed ? "Logout" : undefined}
          className={cn(
            "w-full flex items-center gap-3 rounded-xl text-sm font-semibold transition-all duration-150 text-muted-foreground hover:text-destructive hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer",
            collapsed ? "justify-center p-2.5" : "px-3 py-2"
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        <div className="my-2 border-t border-border/50" />

        {/* Profile Card */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu((v) => !v)}
            className={cn(
              "w-full flex items-center gap-2.5 rounded-xl hover:bg-muted/70 transition-all p-2 text-left cursor-pointer",
              collapsed && "justify-center"
            )}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center flex-shrink-0 shadow-xs">
              <span className="text-xs font-extrabold text-white">SC</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate leading-none">Sarah Chen</p>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">sarah.chen@example.com</p>
              </div>
            )}
            {!collapsed && (
              <ChevronUp
                className={cn(
                  "w-3.5 h-3.5 text-muted-foreground transition-transform",
                  showProfileMenu && "rotate-180"
                )}
              />
            )}
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && !collapsed && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-xl shadow-xl p-1.5 z-40 space-y-0.5">
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  nav("student-account");
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted rounded-lg text-left cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-primary" />
                View Profile & Invoices
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  nav("login");
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-destructive hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-left cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
