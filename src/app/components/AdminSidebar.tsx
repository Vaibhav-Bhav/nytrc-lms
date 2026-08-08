import React, { useState } from "react";
import {
  BarChart2,
  BookOpen,
  Users,
  X,
  LogOut,
  CreditCard,
  Mail,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  ChevronUp,
  User,
  Shield,
} from "lucide-react";
import { Screen } from "../../data/types";
import { cn } from "./Button";
import { Logo } from "./Logo";
import { DarkToggle } from "./DarkToggle";

export function AdminSidebar({
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

  const GROUPS = [
    {
      label: "Overview",
      items: [{ id: "admin-dashboard" as Screen, label: "Dashboard", Icon: BarChart2 }],
    },
    {
      label: "Management",
      items: [
        { id: "admin-content" as Screen, label: "Content", Icon: BookOpen },
        { id: "admin-students" as Screen, label: "Students", Icon: Users },
        { id: "admin-payment-history" as Screen, label: "Payments", Icon: CreditCard },
        { id: "admin-email-log" as Screen, label: "Email Log", Icon: Mail },
      ],
    },
  ];

  function isActive(id: Screen) {
    if (current === id) return true;
    if (id === "admin-students" && (current === "admin-student-detail" || current === "admin-refund")) return true;
    if (id === "admin-dashboard" && (current === "admin-create-course" || current === "admin-dashboard")) return true;
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

      {/* Navigation Groups */}
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

        {GROUPS.map((group, gi) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[11px] font-semibold text-slate-400/70 uppercase tracking-widest">
                {group.label}
              </p>
            )}
            {collapsed && gi > 0 && <div className="my-2 border-t border-white/[0.06]" />}
            <div className="flex flex-col gap-1.5">
              {group.items.map(({ id, label, Icon }) => {
                const active = isActive(id);
                return (
                  <button
                    key={id}
                    onClick={() => nav(id)}
                    title={collapsed ? label : undefined}
                    className={cn(
                      "group relative w-full flex items-center gap-3.5 rounded-[12px] text-sm font-medium transition-all duration-200 ease-in-out text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                      collapsed ? "justify-center p-3" : "px-3.5 py-3",
                      active
                        ? "bg-[#1549A8] text-white shadow-md shadow-blue-950/40 relative overflow-hidden before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[4px] before:bg-cyan-400 before:rounded-r-full"
                        : "bg-transparent text-slate-400 hover:text-slate-100 hover:bg-white/[0.06]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105",
                        active ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                      )}
                    />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Quick Actions */}
        <div>
          {!collapsed && (
            <p className="px-3 mb-2 text-[11px] font-semibold text-slate-400/70 uppercase tracking-widest">
              Quick Actions
            </p>
          )}
          {collapsed && <div className="my-2 border-t border-white/[0.06]" />}

          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => nav("admin-create-course")}
              title={collapsed ? "Create Course" : undefined}
              className={cn(
                "group w-full flex items-center gap-3.5 rounded-[12px] text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] border border-dashed border-white/10 hover:border-blue-500/40 transition-all duration-200 text-left cursor-pointer",
                collapsed ? "justify-center p-3" : "px-3.5 py-2.5"
              )}
            >
              <Plus className="w-5 h-5 flex-shrink-0 text-cyan-400 group-hover:scale-110 transition-transform duration-200" />
              {!collapsed && <span>New Course</span>}
            </button>
          </div>
        </div>
      </nav>

      {/* Footer / Profile Section */}
      <div className={cn("border-t border-white/[0.06] flex-shrink-0 py-4", collapsed ? "px-2.5" : "px-4")}>
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu((v) => !v)}
            className={cn(
              "w-full flex items-center gap-3 rounded-[12px] p-2.5 text-left transition-all duration-200 hover:bg-white/[0.06] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              collapsed && "justify-center"
            )}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-xs font-extrabold text-white">AD</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">Admin User</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">admin@nytrc.org</p>
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
                  nav("admin-dashboard");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-slate-200 hover:bg-white/[0.08] hover:text-white rounded-xl text-left cursor-pointer transition-colors"
              >
                <Shield className="w-4 h-4 text-cyan-400" />
                Admin Dashboard
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  nav("login");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl text-left cursor-pointer transition-colors"
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
