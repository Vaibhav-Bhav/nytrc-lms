import React from "react";
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
        "flex flex-col h-full bg-card border-r border-border transition-all duration-250 ease-in-out overflow-hidden",
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
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="font-black text-sm text-white">L</span>
          </div>
        )}
        {!collapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="ml-auto p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
        {onClose && !collapsed && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors md:hidden">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 overflow-y-auto py-3", collapsed ? "px-2" : "px-3")}>
        {collapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2.5 mb-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        {GROUPS.map((group, gi) => (
          <div key={group.label} className={gi > 0 ? "mt-4" : ""}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                {group.label}
              </p>
            )}
            {collapsed && gi > 0 && <div className="my-2 border-t border-border/50" />}
            <div className="flex flex-col gap-0.5">
              {group.items.map(({ id, label, Icon }) => {
                const active = isActive(id);
                return (
                  <button
                    key={id}
                    onClick={() => nav(id)}
                    title={collapsed ? label : undefined}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg text-sm font-semibold transition-all duration-150 text-left",
                      collapsed ? "justify-center p-2.5" : "px-3 py-2.5",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span>{label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {!collapsed && (
          <>
            <div className="my-3 border-t border-border/50" />
            <p className="px-3 mb-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
              Quick Actions
            </p>
          </>
        )}
        {collapsed && <div className="my-2 border-t border-border/50" />}

        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => nav("admin-create-course")}
            title={collapsed ? "Create Course" : undefined}
            className={cn(
              "w-full flex items-center gap-3 rounded-lg text-sm font-semibold transition-all duration-150 text-left text-muted-foreground hover:text-foreground hover:bg-muted/70",
              collapsed ? "justify-center p-2.5" : "px-3 py-2.5"
            )}
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>New Course</span>}
          </button>
        </div>
      </nav>

      {/* Bottom */}
      <div className={cn("border-t border-border flex-shrink-0 py-2", collapsed ? "px-2" : "px-3")}>
        {!collapsed ? (
          <div className="px-3 py-2">
            <DarkToggle label />
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <DarkToggle />
          </div>
        )}

        <button
          onClick={() => nav("login")}
          title={collapsed ? "Sign out" : undefined}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg text-sm font-semibold transition-all duration-150 text-muted-foreground hover:text-destructive hover:bg-red-50 dark:hover:bg-red-900/20",
            collapsed ? "justify-center p-2.5" : "px-3 py-2"
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>

        <div className="my-2 border-t border-border/50" />

        <div
          className={cn(
            "flex items-center gap-2.5 rounded-xl hover:bg-muted/60 transition-colors cursor-default",
            collapsed ? "justify-center p-2" : "px-2 py-2"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-xs font-bold text-white">A</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate leading-none">Admin</p>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">admin@nytrc.org</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
