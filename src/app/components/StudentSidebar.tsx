import React from "react";
import { LayoutDashboard, GraduationCap, User, LogOut, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Screen } from "../../data/types";
import { cn } from "./Button";
import { Logo } from "./Logo";
import { DarkToggle } from "./DarkToggle";

export function StudentSidebar({
  current,
  onNavigate,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: {
  current: Screen;
  onNavigate: (s: Screen) => void;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const items: [Screen, string, React.ElementType][] = [
    ["student-dashboard", "Dashboard", LayoutDashboard],
    ["student-courses", "My Courses", GraduationCap],
    ["student-account", "Account Settings", User],
  ];

  return (
    <aside
      className={cn(
        "bg-card border-r border-border flex flex-col h-full transition-all duration-300 relative shadow-sm flex-shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-border flex-shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-2 min-w-0">
            <Logo />
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Student
            </span>
          </div>
        ) : (
          <div className="mx-auto flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
              N
            </div>
          </div>
        )}

        <div className="flex items-center">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors md:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {onToggleCollapse && !collapsed && (
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {onToggleCollapse && collapsed && (
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors mx-auto"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-2.5 flex flex-col gap-1.5 overflow-y-auto">
        {items.map(([id, label, Icon]) => {
          const isActive =
            current === id ||
            (current === "student-course-detail" && id === "student-courses") ||
            (current === "course-player" && id === "student-courses");
          return (
            <button
              key={id}
              onClick={() => {
                onNavigate(id);
                onClose?.();
              }}
              title={collapsed ? label : undefined}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left group",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
                collapsed && "justify-center px-0"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {!collapsed && <span className="truncate">{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile & Controls */}
      <div className="p-3 border-t border-border flex-shrink-0 bg-muted/20 space-y-2">
        <div
          onClick={() => {
            onNavigate("student-account");
            onClose?.();
          }}
          title={collapsed ? "Student Account" : undefined}
          className={cn(
            "flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer hover:bg-muted/80 transition-colors",
            collapsed && "justify-center px-0"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs flex-shrink-0 border border-primary/30">
            S
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">Student Account</p>
              <p className="text-[11px] text-muted-foreground truncate">student@nytrc.edu</p>
            </div>
          )}
        </div>

        <div className={cn("pt-1 flex flex-col gap-1", collapsed && "items-center")}>
          <DarkToggle label={!collapsed} />
          <button
            onClick={() => onNavigate("login")}
            title={collapsed ? "Log out" : undefined}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
              collapsed && "justify-center px-0"
            )}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
