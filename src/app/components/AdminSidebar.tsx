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
  Shield,
} from "lucide-react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { cn } from "./Button";
import { Logo } from "./Logo";
import { DarkToggle } from "./DarkToggle";
import { toast } from "sonner";
import { useAuth, authQueryKey } from "../../hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

type NavItem = {
  to: string;
  label: string;
  Icon: React.ElementType;
  /** Also mark active when on any of these paths */
  matchPrefixes?: string[];
};

const GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [{ to: "/admin/dashboard", label: "Dashboard", Icon: BarChart2 }],
  },
  {
    label: "Management",
    items: [
      { to: "/admin/content", label: "Content", Icon: BookOpen },
      {
        to: "/admin/students",
        label: "Students",
        Icon: Users,
        matchPrefixes: ["/admin/students/"],
      },
      { to: "/admin/payments", label: "Payments", Icon: CreditCard },
      { to: "/admin/email-log", label: "Email Log", Icon: Mail },
    ],
  },
];

export function AdminSidebar({
  collapsed = false,
  onToggleCollapse,
  onClose,
}: {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onClose?: () => void;
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { data: user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { location } = useRouterState();
  const currentPath = location.pathname;

  const actualName = user?.name || "Admin User";
  const actualEmail = user?.email || "admin@nytrc.org";
  const initials = actualName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() || "AD";

  function isActive(item: NavItem) {
    if (currentPath === item.to) return true;
    if (item.matchPrefixes?.some((p) => currentPath.startsWith(p))) return true;
    return false;
  }

  async function handleLogout() {
    setShowProfileMenu(false);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        // Treat SESSION_NOT_FOUND as a valid "already logged out" state
        if (res.status !== 404) {
          toast.error(d.error ?? "Logout failed. Please try again.");
          return;
        }
      }
      toast.success("Signed out successfully.");
    } catch {
      // Network error — still navigate to login so the user isn't trapped
      toast.error("Network error during logout.");
    } finally {
      queryClient.setQueryData(authQueryKey, null);
      queryClient.invalidateQueries({ queryKey: authQueryKey });
      navigate({ to: "/login" });
    }
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-[#0B1220] text-slate-300 border-r border-white/[0.06] shadow-xl shadow-black/20 transition-all duration-300 ease-in-out overflow-hidden z-30 select-none",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo Area */}
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
              {group.items.map((item) => {
                const active = isActive(item);
                return (
                  <Link
                    key={item.to}
                    to={item.to as "/"}
                    onClick={() => onClose?.()}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group relative w-full flex items-center gap-3.5 rounded-[12px] text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      collapsed ? "justify-center p-3" : "px-3.5 py-3",
                      active
                        ? "bg-primary text-primary-foreground shadow-md shadow-blue-950/40 relative overflow-hidden before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[4px] before:bg-white before:rounded-r-full"
                        : "bg-transparent text-slate-400 hover:text-slate-100 hover:bg-white/[0.06]"
                    )}
                  >
                    <item.Icon
                      className={cn(
                        "w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105",
                        active ? "text-primary-foreground" : "text-slate-400 group-hover:text-slate-200"
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
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
            <Link
              to="/admin/create-course"
              onClick={() => onClose?.()}
              title={collapsed ? "Create Course" : undefined}
              className={cn(
                "group w-full flex items-center gap-3.5 rounded-[12px] text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] border border-dashed border-white/10 hover:border-primary/40 transition-all duration-200",
                collapsed ? "justify-center p-3" : "px-3.5 py-2.5"
              )}
            >
              <Plus className="w-5 h-5 flex-shrink-0 text-blue-400 group-hover:scale-110 transition-transform duration-200" />
              {!collapsed && <span>New Course</span>}
            </Link>
          </div>
        </div>
      </nav>

      {/* Footer / Profile Section */}
      <div className={cn("border-t border-white/[0.06] flex-shrink-0 py-4", collapsed ? "px-2.5" : "px-4")}>
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu((v) => !v)}
            className={cn(
              "w-full flex items-center gap-3 rounded-[12px] p-2.5 text-left transition-all duration-200 hover:bg-white/[0.06] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              collapsed && "justify-center"
            )}
          >
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 shadow-md font-bold text-xs">
              {initials}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">{actualName}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{actualEmail}</p>
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
              <Link
                to="/admin/dashboard"
                onClick={() => setShowProfileMenu(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-slate-200 hover:bg-white/[0.08] hover:text-white rounded-xl text-left cursor-pointer transition-colors"
              >
                <Shield className="w-4 h-4 text-blue-400" />
                Admin Dashboard
              </Link>
              <button
                onClick={handleLogout}
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
