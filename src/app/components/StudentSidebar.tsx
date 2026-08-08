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
  Shield,
  HelpCircle,
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
        "flex flex-col h-full bg-[#0F172A] text-slate-300 border-r border-white/[0.06] shadow-xl shadow-black/20 transition-all duration-300 ease-in-out overflow-hidden z-30 select-none",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo Area (24px top/bottom & left/right spacing + subtle divider) */}
      <div
        className={cn(
          "flex items-center h-[72px] px-6 border-b border-white/[0.06] flex-shrink-0 gap-3",
          collapsed && "justify-center px-0"
        )}
      >
        {!collapsed && <Logo inverted={true} />}
        {collapsed && (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="font-extrabold text-sm text-white">N</span>
          </div>
        )}
        {!collapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="ml-auto p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200 cursor-pointer"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
        {onClose && !collapsed && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200 md:hidden cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation items list */}
      <nav className={cn("flex-1 overflow-y-auto py-5 space-y-6", collapsed ? "px-2.5" : "px-4")}>
        {collapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-3 mb-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200 cursor-pointer"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}

        {/* Main Section */}
        <div>
          {!collapsed && (
            <p className="px-3 mb-2 text-[11px] font-semibold text-slate-400/70 uppercase tracking-widest">
              Main Navigation
            </p>
          )}
          <div className="flex flex-col gap-1.5">
            {MAIN_NAV.map(({ id, label, Icon }) => {
              const active = isActive(id);
              return (
                <button
                  key={label}
                  onClick={() => nav(id)}
                  title={collapsed ? label : undefined}
                  className={cn(
                    "group relative w-full flex items-center gap-3.5 rounded-[12px] text-sm font-medium transition-all duration-200 ease-in-out text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    collapsed ? "justify-center p-3" : "px-3.5 py-3",
                    active
                      ? "bg-primary text-primary-foreground shadow-md shadow-blue-950/40 relative overflow-hidden before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[4px] before:bg-white before:rounded-r-full"
                      : "bg-transparent text-slate-400 hover:text-slate-100 hover:bg-white/[0.06]"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105",
                      active ? "text-primary-foreground" : "text-slate-400 group-hover:text-slate-200"
                    )}
                  />
                  {!collapsed && <span className="truncate">{label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Section */}
        <div>
          {!collapsed && (
            <p className="px-3 mb-2 text-[11px] font-semibold text-slate-400/70 uppercase tracking-widest">
              Preferences & Support
            </p>
          )}
          {collapsed && <div className="my-2 border-t border-white/[0.06]" />}
          <div className="flex flex-col gap-1.5">
            {SECONDARY_NAV.map(({ id, label, Icon, action }) => {
              const active = isActive(id);
              return (
                <button
                  key={label}
                  onClick={() => (action ? action() : nav(id as Screen))}
                  title={collapsed ? label : undefined}
                  className={cn(
                    "group relative w-full flex items-center gap-3.5 rounded-[12px] text-sm font-medium transition-all duration-200 ease-in-out text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    collapsed ? "justify-center p-3" : "px-3.5 py-3",
                    active
                      ? "bg-primary text-primary-foreground shadow-md shadow-blue-950/40 relative overflow-hidden before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[4px] before:bg-white before:rounded-r-full"
                      : "bg-transparent text-slate-400 hover:text-slate-100 hover:bg-white/[0.06]"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105",
                      active ? "text-primary-foreground" : "text-slate-400 group-hover:text-slate-200"
                    )}
                  />
                  {!collapsed && <span className="truncate">{label}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer / Profile Section */}
      <div className={cn("border-t border-white/[0.06] flex-shrink-0 py-4", collapsed ? "px-2.5" : "px-4")}>
        {/* Profile Card */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu((v) => !v)}
            className={cn(
              "w-full flex items-center gap-3 rounded-[12px] p-2.5 text-left transition-all duration-200 hover:bg-white/[0.06] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              collapsed && "justify-center"
            )}
          >
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 shadow-md font-bold text-xs">
              SC
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">Sarah Chen</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">sarah.chen@example.com</p>
              </div>
            )}
            {!collapsed && (
              <ChevronUp
                className={cn(
                  "w-4 h-4 text-slate-400 transition-transform duration-200",
                  showProfileMenu && "rotate-180"
                )}
              />
            )}
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && !collapsed && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-900 border border-white/[0.1] rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  nav("student-account");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-slate-200 hover:bg-white/[0.08] hover:text-white rounded-xl text-left cursor-pointer transition-colors"
              >
                <User className="w-4 h-4 text-blue-400" />
                View Profile & Invoices
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  nav("login");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-error-foreground hover:bg-error/10 rounded-xl text-left cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
